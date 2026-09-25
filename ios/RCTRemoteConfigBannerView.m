/*
 Copyright 2025 Audienzz AG

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 */

#import "RCTRemoteConfigBannerView.h"
#import "RCTAudienzzViewUtils.h"
#import <React/RCTLog.h>

@interface RCTRemoteConfigBannerView ()
/// The placement the current owner was built for. A prop change that does not change it reuses
/// the owner, so the SDK can recognise the repeat instead of building a second banner.
@property(nonatomic, copy) NSString *loadedAdConfigId;
/// Publisher state requested before the owner existed. `didSetProps` queues creation onto a
/// background queue and then the main queue, so a command can legitimately arrive while
/// `auRemoteConfigBannerView` is still nil — and messaging nil silently drops it.
@property(nonatomic, assign) BOOL pendingPublisherStop;
@property(nonatomic, assign) BOOL pendingHostCover;
@end

@implementation RCTRemoteConfigBannerView {
  AUAdRequestContext *_requestContext;
  RCTBubblingEventBlock _onAdLoaded;
  RCTBubblingEventBlock _onAdFailedToLoad;
  RCTBubblingEventBlock _onAdClicked;
  RCTBubblingEventBlock _onAdOpened;
  RCTBubblingEventBlock _onAdClosed;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    self.semaphore = dispatch_semaphore_create(0);
    self.backgroundQueue =
        dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
  }
  return self;
}

- (void)setAdConfigId:(NSString *)adConfigId {
  _adConfigId = adConfigId;
  self.propsChanged = YES;
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps {
  if (self.propsChanged) {
    // Reserve in React's mount order, before asynchronous configuration/setup work.
    if (!_requestContext) {
      _requestContext = [AUAdRequestContext forSlot:NSUUID.UUID.UUIDString pageKey:self.pageKey];
    }
    dispatch_async(self.backgroundQueue, ^{
      [self createAd];
    });
  }
  self.propsChanged = NO;
}

- (void)createAd {
  dispatch_semaphore_wait(
      self.semaphore,
      dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)));

  dispatch_async(dispatch_get_main_queue(), ^{
    [self internalCreateAd];
  });
}

- (void)internalCreateAd {
  if (!self.adConfigId) {
    RCTLogError(@"[RCTRemoteConfigBannerView] adConfigId is required");
    if (self->_onAdFailedToLoad) {
      self->_onAdFailedToLoad(
          @{@"code" : @(-1), @"message" : @"adConfigId is required"});
    }
    // Balance the wait taken in createAd; returning without this left the semaphore held and
    // made the next prop change wait out its full timeout.
    dispatch_semaphore_signal(self.semaphore);
    return;
  }

  // didSetProps fires on every prop change, and each run used to allocate another owner while
  // its predecessor's banner stayed in this view's subviews — still registered with the page
  // coordinator and still refreshing. Reuse the owner for the same placement (the SDK coalesces
  // the repeat), and destroy it before switching to a different one.
  if (self.auRemoteConfigBannerView != nil &&
      ![self.loadedAdConfigId isEqualToString:self.adConfigId]) {
    [self.auRemoteConfigBannerView destroy];
    self.auRemoteConfigBannerView = nil;
  }
  if (self.auRemoteConfigBannerView == nil) {
    self.auRemoteConfigBannerView =
        [[AURemoteConfigBannerView alloc] initWithAdConfigId:self.adConfigId];
    if (!_requestContext) _requestContext = [AUAdRequestContext new];
    self.auRemoteConfigBannerView.requestContext = _requestContext;
    self.loadedAdConfigId = self.adConfigId;
  }

  // Must precede loadIn:, which is where the ad joins the current page.
  if (self.pageKey != nil) {
    [self.auRemoteConfigBannerView setScreen:self.pageKey];
  }

  UIViewController *rootViewController = [RCTAudienzzViewUtils rootViewControllerForView:self];

  // Before loadIn:, which is where the owner builds the banner and it can request.
  [self applyPendingPublisherState];

  [self.auRemoteConfigBannerView loadIn:self
                                  width:self.bounds.size.width
                                 height:self.bounds.size.height
                     rootViewController:rootViewController
                               delegate:self];

  dispatch_semaphore_signal(self.semaphore);
}

/// React Native releases the view when the component unmounts; Android already tears the
/// placement down in onDropViewInstance, and iOS had no equivalent at all.
- (void)dealloc {
  [_auRemoteConfigBannerView destroy];
}

- (void)reloadIfVisible {
  // Force a fresh auction now — but only when on screen. The pageImpression
  // broadcast reaches every mounted banner, including those on inactive
  // (kept-mounted) screens; skip those so we don't burn an auction.
  if (self.window == nil || self.isHidden || self.alpha < 0.01) {
    return;
  }
  CGRect frameInWindow = [self convertRect:self.bounds toView:nil];
  if (!CGRectIntersectsRect(frameInWindow, self.window.bounds)) {
    return;
  }
  [self.auRemoteConfigBannerView reloadAd];
}

- (void)stopAutoRefresh {
  self.pendingPublisherStop = YES;
  [self.auRemoteConfigBannerView stopAutoRefresh];
}

- (void)resumeAutoRefresh {
  self.pendingPublisherStop = NO;
  [self.auRemoteConfigBannerView resumeAutoRefresh];
}

/// Replays whatever the host asked for before the owner existed. The stop goes on first, before
/// loadIn: can request.
- (void)applyPendingPublisherState {
  if (self.pendingPublisherStop) {
    [self.auRemoteConfigBannerView stopAutoRefresh];
  }
  if (self.pendingHostCover) {
    [self.auRemoteConfigBannerView pauseSmartRefresh];
  }
}

/// A cover the SDK cannot infer — a pointer-transparent veil, a painted overlay. Current state, not
/// an event, and separate from the publisher pause: clearing one must not clear the other.
- (void)setCovered:(BOOL)covered {
  self.pendingHostCover = covered;
  if (covered) {
    [self.auRemoteConfigBannerView pauseSmartRefresh];
  } else {
    [self.auRemoteConfigBannerView resumeSmartRefresh];
  }
}

#pragma mark - Event Handlers

- (void)setOnAdLoaded:(RCTBubblingEventBlock)onAdLoaded {
  _onAdLoaded = onAdLoaded;
}

- (void)setOnAdFailedToLoad:(RCTBubblingEventBlock)onAdFailedToLoad {
  _onAdFailedToLoad = onAdFailedToLoad;
}

- (void)setOnAdClicked:(RCTBubblingEventBlock)onAdClicked {
  _onAdClicked = onAdClicked;
}

- (void)setOnAdOpened:(RCTBubblingEventBlock)onAdOpened {
  _onAdOpened = onAdOpened;
}

- (void)setOnAdClosed:(RCTBubblingEventBlock)onAdClosed {
  _onAdClosed = onAdClosed;
}

#pragma mark - GADBannerViewDelegate

- (void)bannerViewDidReceiveAd:(GADBannerView *)bannerView {
  if (_onAdLoaded) {
    _onAdLoaded(@{
      @"width" : @(bannerView.adSize.size.width),
      @"height" : @(bannerView.adSize.size.height)
    });
  }
}

- (void)bannerView:(GADBannerView *)bannerView
    didFailToReceiveAdWithError:(NSError *)error {
  if (_onAdFailedToLoad) {
    _onAdFailedToLoad(
        @{@"code" : @(error.code), @"message" : [error localizedDescription]});
  }
}

- (void)bannerViewDidRecordClick:(GADBannerView *)bannerView {
  if (_onAdClicked) {
    _onAdClicked(@{});
  }
}

- (void)bannerViewWillPresentScreen:(GADBannerView *)bannerView {
  if (_onAdOpened) {
    _onAdOpened(@{});
  }
}

- (void)bannerViewDidDismissScreen:(GADBannerView *)bannerView {
  if (_onAdClosed) {
    _onAdClosed(@{});
  }
}

@end
