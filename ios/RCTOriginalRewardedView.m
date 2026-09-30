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

@interface RCTOriginalRewardedView ()
/// What the current rewarded ad was built for. A prop change that does not change it reuses the ad
/// already held instead of buying another one.
@property(nonatomic, copy) NSString *loadedIdentity;
@end

@implementation RCTOriginalRewardedView

- (void)dealloc {
  [_auRewardedView destroy];
}

- (void)createAd {
  dispatch_semaphore_wait(self.semaphore, dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)));
  
  dispatch_async(dispatch_get_main_queue(), ^{
    [self internalCreateAd];
  });
}

- (void)internalCreateAd {
  [super internalCreateAd];

  // Props land incrementally and creation runs on a debounce: without both identifiers this would
  // build an ad from empty defaults. The next prop transaction retries.
  if (self.adUnitID.length == 0 || self.auConfigID.length == 0) {
    NSLog(@"[Audienzz] Rewarded ad creation skipped — adUnitID/auConfigID not ready");
    return;
  }

  // didSetProps fires on every prop change, and each run allocated another AURewardedView and
  // started another auction. Keep the ad already held unless the placement itself changed.
  NSString *identity = [NSString stringWithFormat:@"%@|%@", self.auConfigID, self.adUnitID];
  if (_auRewardedView != nil && [identity isEqualToString:self.loadedIdentity]) {
    return;
  }
  if (_auRewardedView != nil) {
    [_auRewardedView destroy];
    [_auRewardedView removeFromSuperview];
    _auRewardedView = nil;
  }
  self.loadedIdentity = identity;

  GAMRequest *request = [GAMRequest request];

  _auRewardedView = [[AURewardedView alloc] initWithConfigId: self.auConfigID isLazyLoad:self.isLazyLoad];
  
  if(self.pbAdSlot != nil) {
    [_auRewardedView.adUnitConfiguration setAdSlot:self.pbAdSlot];
  }
  if(self.gpID != nil) {
    [_auRewardedView.adUnitConfiguration setGPID:self.gpID];
  }
  if(self.impOrtbConfig != nil){
    [_auRewardedView setImpOrtbConfigWithOrtbConfig:self.impOrtbConfig];
  }
  
  // Full-screen video is an interstitial placement; the shared view leaves it unset.
  [self.videoParameters setPlacement:AUPlacementInterstitial];
  [self.videoParameters setPlcmnt:AUPlcmntInterstitial];
  _auRewardedView.videoParameters = self.videoParameters;
  _auRewardedView.frame = CGRectMake(0, 0, 10, 10);
  
  [self addSubview:_auRewardedView];

  // Installed BEFORE createAdWith:, which issues the first request itself when not lazy.
  __weak typeof(self) weakSelf = self;
  _auRewardedView.onLoadRequest = ^(id _Nonnull request) {
    __strong typeof(weakSelf) self = weakSelf;
    if (self == nil) {
      return;
    }
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

  [_auRewardedView createAdWith:request adUnitID:self.adUnitID];

}


#pragma mark - GADFullScreenContentDelegate

- (void)ad:(nonnull id<GADFullScreenPresentingAd>)ad
didFailToPresentFullScreenContentWithError:(nonnull NSError *)error {
  // Surfaced, not only logged: a bid won and then not shown has to be observable.
  [self.auRewardedView removeFromSuperview];
  self.auRewardedView = nil;
  self.loadedIdentity = nil;
  if (self.onAdFailedToShow) {
    self.onAdFailedToShow(@{@"code": @(error.code), @"message": [error localizedDescription]});
  }
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
  
  self.loadedIdentity = nil;
  if (self.onAdClosed) {
    // Dismissed without earning: `reward` is nil, and a dictionary literal with a nil value throws.
    NSString *rewardType = self.reward.type ?: @"";
    NSNumber *rewardAmount = self.reward.amount ?: @0;
    self.onAdClosed(@{@"type": rewardType, @"amount": rewardAmount});
  }
  self.reward = nil;
}

- (void)adDidDismissFullScreenContent:(nonnull id<GADFullScreenPresentingAd>)ad {
  NSLog(@"Ad did dismiss full screen content.");
}

@end
