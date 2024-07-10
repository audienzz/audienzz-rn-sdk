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

#import "RCTRenderingRewardedView.h"
#import "AUConverter.h"
#import <GoogleMobileAds/GoogleMobileAds.h>
#import <AudienzziOSSDK/AudienzziOSSDK-Swift.h>

@implementation RCTRenderingRewardedView

- (void)setMinSizesPercentage:(NSArray<NSNumber *> *)value {
    _minSizesPercentage = value;
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
    
    _eventHandler = [[AUGAMRewardedAdEventHandler alloc] initWithAdUnitID:self.adUnitID];
    _auRewardedView = [[AURewardedRenderingView alloc] initWithConfigId:self.auConfigID isLazyLoad:self.isLazyLoad minSizePerc:minSizePerc eventHandler:_eventHandler];
    
    if(self.keyword != nil) {
        [_auRewardedView.adUnitConfiguration addExtKeyword:self.keyword];
    }
    if(self.keywords != nil) {
        NSSet<NSString *> *keywordsSet = [NSSet setWithArray:self.keywords];
        [_auRewardedView.adUnitConfiguration addExtKeywords:keywordsSet];
    }
    if(self.pbAdSlot != nil) {
        [_auRewardedView.adUnitConfiguration setAdSlot:self.pbAdSlot];
    }
    if(self.gpID != nil) {
        [_auRewardedView.adUnitConfiguration setGPID:self.gpID];
    }
    if(self.appContent != nil) {
        [_auRewardedView.adUnitConfiguration setAppContent:self.appContent];
    }
    
    _auRewardedView.delegate = self;
    _auRewardedView.frame = CGRectMake(0, 0, 10, 10);
    
    [self addSubview:_auRewardedView];
    [_auRewardedView createAd];
    
}


#pragma mark - AURewardedAdUnitDelegate

- (void)rewardedAdDidDisplayOnScreen {}

- (void)rewardedAdDidReceiveAd {
    if (self.onAdLoaded) {
        self.onAdLoaded(@{});
    }
    
    UIResponder *responder = self;
    while ([responder isKindOfClass:[UIView class]]) {
        responder = [responder nextResponder];
    }
    [_auRewardedView showAd:(UIViewController *)responder];
}

- (void)rewardedAdUserDidEarnReward:(NSObject * _Nullable)reward {
    [self.auRewardedView removeFromSuperview];
    self.auRewardedView = nil;
    
    if (self.onAdClosed) {
        self.onAdClosed(@{});
    }
}

- (void)rewardedAdDidFailToReceiveAdWithError:(NSError * _Nullable)error {
    [self.auRewardedView removeFromSuperview];
    self.auRewardedView = nil;
    
    if (self.onAdFailedToLoad) {
        self.onAdFailedToLoad(@{@"code": @(error.code), @"message": [error localizedDescription]});
    }
}

- (void)rewardedAdWillPresentAd {
    if (self.onAdOpened) {
        self.onAdOpened(@{});
    }
}

- (void)rewardedAdWillLeaveApplication {}

- (void)rewardedAdDidClickAd {
    if (self.onAdClicked) {
        self.onAdClicked(@{});
    }
}

@end
