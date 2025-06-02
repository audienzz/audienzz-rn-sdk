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

#import "RCTOriginalRewardedView.h"
#import "AUConverter.h"
#import <GoogleMobileAds/GoogleMobileAds.h>
#import <AudienzziOSSDK/AudienzziOSSDK-Swift.h>

@implementation RCTOriginalRewardedView

- (void)createAd {
    dispatch_semaphore_wait(self.semaphore, dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)));
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self internalCreateAd];
    });
}

- (void)internalCreateAd {
    [super internalCreateAd];
    
    GADRequest *request = [GADRequest request];
    
    _auRewardedView = [[AURewardedView alloc] initWithConfigId: self.auConfigID isLazyLoad:self.isLazyLoad];
    
    if(self.pbAdSlot != nil) {
        [_auRewardedView.adUnitConfiguration setAdSlot:self.pbAdSlot];
    }
    if(self.gpID != nil) {
        [_auRewardedView.adUnitConfiguration setGPID:self.gpID];
    }
    
    _auRewardedView.parameters = self.videoParameters;
    _auRewardedView.frame = CGRectMake(0, 0, 10, 10);
    
    [self addSubview:_auRewardedView];
//    [_auRewardedView createAdWith:request];
    [_auRewardedView createAdWith:request adUnitID:self.adUnitID];
    
    __weak typeof(self) weakSelf = self;
    _auRewardedView.onLoadRequest = ^(id _Nonnull request) {
        __strong typeof(weakSelf) self = weakSelf;
        if (![request isKindOfClass:[GADRequest class]]) {
            NSLog(@"Failed request unwrap");
            return;
        }
        
        [GADRewardedAd loadWithAdUnitID:self.adUnitID request:request completionHandler:^(GADRewardedAd *ad, NSError *error) {
            if (error) {
                if (self.onAdFailedToLoad) {
                    [self.auRewardedView removeFromSuperview];
                    self.auRewardedView = nil;
                    
                    self.onAdFailedToLoad(@{@"code": @(error.code), @"message": [error localizedDescription]});
                }
            } else if (ad) {
                if (self.onAdLoaded) {
                    self.onAdLoaded(@{});
                }
                
                ad.fullScreenContentDelegate = self;
                
                AURewardedEventHandler *eventHandler = [[AURewardedEventHandler alloc] initWithAdUnit:ad];
                [self.auRewardedView connectHandler:eventHandler];
                
                [ad presentFromRootViewController:nil userDidEarnRewardHandler:^{
                    GADAdReward *reward = ad.adReward;
                    self.reward = reward;
                }];
            }
        }];
    };
}


#pragma mark - GADFullScreenContentDelegate

- (void)ad:(nonnull id<GADFullScreenPresentingAd>)ad
didFailToPresentFullScreenContentWithError:(nonnull NSError *)error {
    NSLog(@"Ad did fail to present full screen content. %@", error.localizedDescription);
}

- (void)adWillPresentFullScreenContent:(nonnull id<GADFullScreenPresentingAd>)ad {
    if (self.onAdOpened) {
        self.onAdOpened(@{});
    }
}

- (void)adDidRecordClick:(nonnull id<GADFullScreenPresentingAd>)ad {
    if (self.onAdClicked) {
        self.onAdClicked(@{});
    }
}

- (void)adWillDismissFullScreenContent:(nonnull id<GADFullScreenPresentingAd>)ad {
    [self.auRewardedView removeFromSuperview];
    self.auRewardedView = nil;
    
    if (self.onAdClosed) {
        NSDictionary *rewardDict = @{@"type": self.reward.type, @"amount": self.reward.amount};
        self.onAdClosed(rewardDict);
    }
}

- (void)adDidDismissFullScreenContent:(nonnull id<GADFullScreenPresentingAd>)ad {
    NSLog(@"Ad did dismiss full screen content.");
}

@end
