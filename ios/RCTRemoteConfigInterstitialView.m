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

#import "RCTRemoteConfigInterstitialView.h"
#import <React/RCTLog.h>

@implementation RCTRemoteConfigInterstitialView {
  RCTBubblingEventBlock _onAdLoaded;
  RCTBubblingEventBlock _onAdFailedToLoad;
  RCTBubblingEventBlock _onAdClicked;
  RCTBubblingEventBlock _onAdOpened;
  RCTBubblingEventBlock _onAdClosed;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    // Interstitial doesn't need semaphore/background queue
  }
  return self;
}

- (void)setAdConfigId:(NSString *)adConfigId {
  _adConfigId = adConfigId;
  self.propsChanged = YES;

  if (_adConfigId) {
    self.auRemoteConfigInterstitial =
        [[AURemoteConfigInterstitial alloc] initWithAdConfigId:_adConfigId];
    self.auRemoteConfigInterstitial.delegate = self;
  }
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps {
  if (self.propsChanged) {
    [self createAd];
  }
  self.propsChanged = NO;
}

- (void)createAd {
  [self load];
}

- (void)load {
  if (!self.auRemoteConfigInterstitial) {
    RCTLogError(@"[RCTRemoteConfigInterstitialView] adConfigId must be set "
                @"before loading");
    if (_onAdFailedToLoad) {
      _onAdFailedToLoad(
          @{@"code" : @(-1), @"message" : @"adConfigId is required"});
    }
    return;
  }

  __weak typeof(self) weakSelf = self;
  [self.auRemoteConfigInterstitial
      loadWithCompletion:^(NSError *_Nullable error) {
        __strong typeof(weakSelf) strongSelf = weakSelf;
        if (!strongSelf)
          return;

        if (error) {
          RCTLogError(@"[RCTRemoteConfigInterstitialView] Failed to load: %@",
                      error.localizedDescription);
          if (strongSelf->_onAdFailedToLoad) {
            strongSelf->_onAdFailedToLoad(@{
              @"code" : @(error.code),
              @"message" : [error localizedDescription]
            });
          }
        } else {
          if (strongSelf->_onAdLoaded) {
            strongSelf->_onAdLoaded(@{});
          }
          [strongSelf show];
        }
      }];
}

- (void)show {
  if (!self.auRemoteConfigInterstitial ||
      !self.auRemoteConfigInterstitial.isReady) {
    RCTLogError(@"[RCTRemoteConfigInterstitialView] Ad not ready to show");
    return;
  }

  UIViewController *rootViewController =
      [[[[UIApplication sharedApplication] delegate] window]
          rootViewController];
  [self.auRemoteConfigInterstitial showFrom:rootViewController];
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

#pragma mark - GADFullScreenContentDelegate

- (void)adDidRecordClick:(id<GADFullScreenPresentingAd>)ad {
  if (_onAdClicked) {
    _onAdClicked(@{});
  }
}

- (void)adWillPresentFullScreenContent:(id<GADFullScreenPresentingAd>)ad {
  if (_onAdOpened) {
    _onAdOpened(@{});
  }
}

- (void)adDidDismissFullScreenContent:(id<GADFullScreenPresentingAd>)ad {
  if (_onAdClosed) {
    _onAdClosed(@{});
  }
}

- (void)ad:(id<GADFullScreenPresentingAd>)ad
    didFailToPresentFullScreenContentWithError:(NSError *)error {
  if (_onAdFailedToLoad) {
    _onAdFailedToLoad(
        @{@"code" : @(error.code), @"message" : [error localizedDescription]});
  }
}

@end
