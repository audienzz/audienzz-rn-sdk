#import <UIKit/UIKit.h>
#import <XCTest/XCTest.h>
#import <objc/runtime.h>
#import <audienzz/RCTOriginalBannerView.h>
#import <audienzz/RCTRemoteConfigBannerView.h>
#import <audienzz/RCTOriginalInterstitialView.h>
#import <audienzz/RCTOriginalRewardedView.h>
#import <audienzz/RCTAudienzzViewUtils.h>

@interface RCTOriginalInterstitialView (AuditTests)
- (NSString *)mergeBannerFormatIntoOrtbConfig:(NSString *)config sizes:(NSArray *)sizes;
@end

// Replace only the network boundaries. The production RN view creates the SDK and Google views,
// installs its real callback and tears them down. No auctions or live Google requests are sent.
static GAMRequest *SDKRequest;
static GADRequest *GoogleRequest;
static NSUInteger GoogleLoads;
static BOOL CallbackInstalledAtCreation;
static GADRequest *RewardedRequest;

@interface AUBannerView (AuditTests)
- (void)audit_createAdWith:(GAMRequest *)request gamBanner:(UIView *)banner eventHandler:(AUBannerEventHandler *)handler;
@end
@implementation AUBannerView (AuditTests)
- (void)audit_createAdWith:(GAMRequest *)request gamBanner:(UIView *)banner eventHandler:(AUBannerEventHandler *)handler {
  [self addSubview:banner];
  CallbackInstalledAtCreation = self.onLoadRequest != nil;
  if (self.onLoadRequest) self.onLoadRequest(SDKRequest);
}
@end

@interface AURewardedView (AuditTests)
- (void)audit_createAdWith:(GAMRequest *)request adUnitID:(NSString *)adUnitID;
@end
@implementation AURewardedView (AuditTests)
- (void)audit_createAdWith:(GAMRequest *)request adUnitID:(NSString *)adUnitID {
  RewardedRequest = request;
}
@end

@interface GAMBannerView (AuditTests)
- (void)audit_loadRequest:(GADRequest *)request;
@end
@implementation GAMBannerView (AuditTests)
- (void)audit_loadRequest:(GADRequest *)request {
  GoogleRequest = request;
  GoogleLoads++;
}
@end

// Control the asynchronous setup boundary; the real didSetProps and internalCreateAd run.
@interface DeferredBanner : RCTOriginalBannerView
@end
@implementation DeferredBanner
- (void)createAd {}
@end
@interface DeferredRemoteBanner : RCTRemoteConfigBannerView
@end
@implementation DeferredRemoteBanner
- (void)createAd {}
@end

@interface AudienzzrnExampleTests : XCTestCase
@end
@implementation AudienzzrnExampleTests

- (void)setUp {
  [super setUp];
  SDKRequest = [GAMRequest request];
  SDKRequest.customTargeting = @{@"hb_pb": @"1.20", @"global": @"current", @"au_page_seq": @"8"};
  GoogleRequest = nil;
  GoogleLoads = 0;
  CallbackInstalledAtCreation = NO;
  RewardedRequest = nil;
  method_exchangeImplementations(class_getInstanceMethod(AURewardedView.class, @selector(createAdWith:adUnitID:)),
                                 class_getInstanceMethod(AURewardedView.class, @selector(audit_createAdWith:adUnitID:)));
  method_exchangeImplementations(class_getInstanceMethod(AUBannerView.class, @selector(createAdWith:gamBanner:eventHandler:)),
                                 class_getInstanceMethod(AUBannerView.class, @selector(audit_createAdWith:gamBanner:eventHandler:)));
  // loadRequest: is inherited: give GAMBannerView its own implementation before swapping it, so
  // other Google ad classes retain their ordinary method table.
  Method load = class_getInstanceMethod(GAMBannerView.class, @selector(loadRequest:));
  class_addMethod(GAMBannerView.class, @selector(loadRequest:), method_getImplementation(load), method_getTypeEncoding(load));
  method_exchangeImplementations(class_getInstanceMethod(GAMBannerView.class, @selector(loadRequest:)),
                                 class_getInstanceMethod(GAMBannerView.class, @selector(audit_loadRequest:)));
}

- (void)tearDown {
  method_exchangeImplementations(class_getInstanceMethod(AURewardedView.class, @selector(createAdWith:adUnitID:)),
                                 class_getInstanceMethod(AURewardedView.class, @selector(audit_createAdWith:adUnitID:)));
  method_exchangeImplementations(class_getInstanceMethod(AUBannerView.class, @selector(createAdWith:gamBanner:eventHandler:)),
                                 class_getInstanceMethod(AUBannerView.class, @selector(audit_createAdWith:gamBanner:eventHandler:)));
  method_exchangeImplementations(class_getInstanceMethod(GAMBannerView.class, @selector(loadRequest:)),
                                 class_getInstanceMethod(GAMBannerView.class, @selector(audit_loadRequest:)));
  SDKRequest = nil;
  GoogleRequest = nil;
  RewardedRequest = nil;
  [super tearDown];
}

- (RCTOriginalBannerView *)newBanner {
  RCTOriginalBannerView *view = [RCTOriginalBannerView new];
  view.adUnitID = @"/test/banner";
  view.auConfigID = @"test-placement";
  view.sizes = @[@{@"width": @300, @"height": @250}];
  view.adFormats = @[@"banner"];
  view.videoBitrate = @[@300, @1500];
  view.videoDuration = @[@5, @30];
  return view;
}

- (void)testBannerIdentityIsReservedBeforeAsynchronousCreation {
  DeferredBanner *first = [DeferredBanner new];
  DeferredRemoteBanner *second = [DeferredRemoteBanner new];
  first.auConfigID = @"first";
  second.adConfigId = @"second";
  [first didSetProps:@[@"auConfigID"]];
  [second didSetProps:@[@"adConfigId"]];
  AUAdRequestContext *firstContext = [first valueForKey:@"requestContext"];
  AUAdRequestContext *secondContext = [second valueForKey:@"requestContext"];
  XCTAssertNotNil(firstContext, @"Original banner must reserve before createAd runs");
  XCTAssertNotNil(secondContext, @"Remote banner must reserve before config resolution");
  XCTAssertNotEqual(firstContext, secondContext);
  first.videoBitrate = @[@300, @1500]; first.videoDuration = @[@5, @30];
  first.sizes = @[@{@"width": @300, @"height": @250}];
  first.adFormats = @[@"banner"]; first.adUnitID = @"/test";
  [first internalCreateAd];
  XCTAssertEqual(first.auBannerView.requestContext, firstContext);
  [first didSetProps:@[@"sizes"]];
  XCTAssertEqual([first valueForKey:@"requestContext"], firstContext);
}

- (void)testSDKRequestIsForwardedOnInitialAndReplacementDelivery {
  RCTOriginalBannerView *view = [self newBanner];
  [view internalCreateAd];
  XCTAssertTrue(CallbackInstalledAtCreation);
  XCTAssertEqual(GoogleLoads, 1u);
  XCTAssertEqual(GoogleRequest, SDKRequest);
  XCTAssertEqualObjects(((GAMRequest *)GoogleRequest).customTargeting, SDKRequest.customTargeting);

  GAMRequest *replacement = [GAMRequest request];
  replacement.customTargeting = @{@"hb_pb": @"2.50", @"au_page_seq": @"9"};
  XCTAssertNotNil(view.auBannerView.onLoadRequest);
  view.auBannerView.onLoadRequest(replacement);
  XCTAssertEqual(GoogleLoads, 2u);
  XCTAssertEqual(GoogleRequest, replacement);
}

- (void)testReplacingBannerRetiresPreviousOwnerAndItsCallback {
  RCTOriginalBannerView *view = [self newBanner];
  [view internalCreateAd];
  AUBannerView *previous = view.auBannerView;
  [view internalCreateAd];
  XCTAssertNotEqual(view.auBannerView, previous);
  XCTAssertNil(previous.superview);
  XCTAssertNil(previous.onLoadRequest);
  XCTAssertEqual(view.subviews.count, 1u);
}

- (void)testBannerAndOwnerCanDeallocateAfterUnmount {
  __weak RCTOriginalBannerView *weakView;
  __weak AUBannerView *weakAd;
  @autoreleasepool {
    RCTOriginalBannerView *view = [self newBanner];
    [view internalCreateAd];
    weakView = view;
    weakAd = view.auBannerView;
    XCTAssertNotNil(weakView);
    XCTAssertNotNil(weakAd);
  }
  XCTAssertNil(weakView);
  XCTAssertNil(weakAd);
}

- (void)testStaleGoogleFailureCannotRemoveReplacementBanner {
  RCTOriginalBannerView *view = [self newBanner];
  [view internalCreateAd];
  GAMBannerView *oldGoogle = view.bannerView;
  [view internalCreateAd];
  AUBannerView *replacement = view.auBannerView;
  [view bannerView:oldGoogle didFailToReceiveAdWithError:[NSError errorWithDomain:@"Google" code:3 userInfo:nil]];
  XCTAssertEqual(view.auBannerView, replacement);
  XCTAssertEqual(replacement.superview, view);
}

- (void)testSizeWorkaroundPreservesPublisherORTBFields {
  RCTOriginalInterstitialView *view = [RCTOriginalInterstitialView new];
  NSString *merged = [view mergeBannerFormatIntoOrtbConfig:
    @"{\"bidfloor\":2.5,\"pmp\":{\"private_auction\":1},\"banner\":{\"pos\":1,\"format\":[{\"w\":1,\"h\":1}]}}"
    sizes:@[@{@"width": @320, @"height": @480}]];
  XCTAssertNotNil(merged);
  NSDictionary *config = [NSJSONSerialization JSONObjectWithData:[merged dataUsingEncoding:NSUTF8StringEncoding] options:0 error:nil];
  XCTAssertEqualObjects(config[@"bidfloor"], @2.5);
  XCTAssertEqualObjects(config[@"pmp"], @{@"private_auction": @1});
  XCTAssertEqualObjects(config[@"banner"][@"pos"], @1);
  XCTAssertEqualObjects(config[@"banner"][@"format"], (@[@{@"w": @320, @"h": @480}]));
}

- (void)testRewardlessDismissalAndPresentationFailureReachPublisher {
  RCTOriginalRewardedView *view = [RCTOriginalRewardedView new];
  __block NSDictionary *closed = nil;
  __block NSDictionary *failed = nil;
  view.onAdClosed = ^(NSDictionary *event) { closed = event; };
  view.onAdFailedToShow = ^(NSDictionary *event) { failed = event; };
  [view adWillDismissFullScreenContent:nil];
  XCTAssertEqualObjects(closed, (@{@"type": @"", @"amount": @0}));
  [view ad:nil didFailToPresentFullScreenContentWithError:
    [NSError errorWithDomain:@"Google" code:7 userInfo:@{NSLocalizedDescriptionKey: @"cannot present"}]];
  XCTAssertEqualObjects(failed[@"code"], @7);
  XCTAssertEqualObjects(failed[@"message"], @"cannot present");
}

- (void)testRewardedUsesTheAdManagerRequestRequiredByTheNativeSDK {
  RCTOriginalRewardedView *view = [RCTOriginalRewardedView new];
  view.adUnitID = @"/test/rewarded";
  view.auConfigID = @"test-placement";
  view.videoBitrate = @[@300, @1500];
  view.videoDuration = @[@5, @30];
  [view internalCreateAd];
  XCTAssertNotNil(RewardedRequest);
  XCTAssertTrue([RewardedRequest isKindOfClass:GAMRequest.class]);
  XCTAssertNotNil(view.auRewardedView.onLoadRequest);
}

- (void)testRootControllerComesFromTheAdsOwnWindow {
  UIWindow *window = [[UIWindow alloc] initWithFrame:CGRectMake(0, 0, 320, 600)];
  UIViewController *controller = [UIViewController new];
  window.rootViewController = controller;
  UIView *view = [UIView new];
  [controller.view addSubview:view];
  window.hidden = NO;
  XCTAssertEqual(view.window, window);
  XCTAssertEqual([RCTAudienzzViewUtils rootViewControllerForView:view], controller);
  window.hidden = YES;
}
@end
