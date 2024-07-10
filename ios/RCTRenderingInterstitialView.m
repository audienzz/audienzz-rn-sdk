/*
    Copyright 2024 Audienzz AG

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

#import "RCTRenderingInterstitialView.h"
#import "AUConverter.h"
#import <GoogleMobileAds/GoogleMobileAds.h>
#import <AudienzziOSSDK/AudienzziOSSDK-Swift.h>

@implementation RCTRenderingInterstitialView

- (void)setAdFormat:(NSString *)value{
    _adFormat = value;
    self.propsChanged = YES;
}

- (void)setMinSizesPercentage:(NSArray<NSNumber *> *)value {
    _minSizesPercentage = value;
    self.propsChanged = YES;
}

- (void)setSkipDelay:(NSNumber *)value {
    _skipDelay = [value floatValue];
    self.propsChanged = YES;
}

- (void)createAd {
    dispatch_semaphore_wait(self.semaphore, dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)));
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self internalCreateAd];
    });
}

- (void)internalCreateAd {
    [super internalCreateAd];
    
    CGSize size = CGSizeMake([_minSizesPercentage[0] integerValue], [_minSizesPercentage[1] integerValue]);
    NSValue *minSizePerc = [NSValue valueWithCGSize:size];
    
    _eventHandler = [[AUGAMInterstitialEventHandler alloc] initWithAdUnitID:self.adUnitID];
    _auInterstitialView = [[AUInterstitialRenderingView alloc] initWithConfigId:self.auConfigID isLazyLoad:self.isLazyLoad adFormat:[AUConverter adFormatFromString:_adFormat] minSizePerc:minSizePerc eventHandler:_eventHandler];
    
    if(self.keyword != nil) {
        [_auInterstitialView.adUnitConfiguration addExtKeyword:self.keyword];
    }
    if(self.keywords != nil) {
        NSSet<NSString *> *keywordsSet = [NSSet setWithArray:self.keywords];
        [_auInterstitialView.adUnitConfiguration addExtKeywords:keywordsSet];
    }
    if(self.pbAdSlot != nil) {
        [_auInterstitialView.adUnitConfiguration setAdSlot:self.pbAdSlot];
    }
    if(self.gpID != nil) {
        [_auInterstitialView.adUnitConfiguration setGPID:self.gpID];
    }
    if(self.appContent != nil) {
        [_auInterstitialView.adUnitConfiguration setAppContent:self.appContent];
    }
    
    [_auInterstitialView setSkipDelay:_skipDelay];

    _auInterstitialView.delegate = self;
    _auInterstitialView.frame = CGRectMake(0, 0, 10, 10);
    
    [self addSubview:_auInterstitialView];
    [_auInterstitialView createAd];
}

#pragma mark - AUInterstitialRenderingAdDelegate

- (void)interstitialAdDidDisplayOnScreen {}

- (void)interstitialDidReceiveAdWith:(NSString * _Nonnull)configId {
    if (self.onAdLoaded) {
        self.onAdLoaded(@{});
    }
    
    UIResponder *responder = self;
    while ([responder isKindOfClass:[UIView class]]) {
        responder = [responder nextResponder];
    }
    [_auInterstitialView showAd:(UIViewController *)responder];
}

- (void)interstitialdidFailToReceiveAdWithErrorWithError:(NSError * _Nullable)error {
    [self.auInterstitialView removeFromSuperview];
    self.auInterstitialView = nil;
    
    if (self.onAdFailedToLoad) {
        self.onAdFailedToLoad(@{@"code": @(error.code), @"message": [error localizedDescription]});
    }
}

- (void)interstitialWillPresentAd {
    if (self.onAdOpened) {
        self.onAdOpened(@{});
    }
}

- (void)interstitialDidDismissAd {
    [self.auInterstitialView removeFromSuperview];
    self.auInterstitialView = nil;
    
    if (self.onAdClosed) {
        self.onAdClosed(@{});
    }
}

- (void)interstitialWillLeaveApplication {}

- (void)interstitialDidClickAd {
    if (self.onAdClicked) {
        self.onAdClicked(@{});
    }
}

@end

