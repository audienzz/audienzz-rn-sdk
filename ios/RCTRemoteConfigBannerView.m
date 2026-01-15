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
#import <React/RCTLog.h>

@implementation RCTRemoteConfigBannerView {
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
    return;
  }

  self.auRemoteConfigBannerView =
      [[AURemoteConfigBannerView alloc] initWithAdConfigId:self.adConfigId];

  UIViewController *rootViewController =
      [[[[UIApplication sharedApplication] delegate] window]
          rootViewController];

  [self.auRemoteConfigBannerView loadIn:self
                                  width:self.bounds.size.width
                                 height:self.bounds.size.height
                     rootViewController:rootViewController
                               delegate:self];

  dispatch_semaphore_signal(self.semaphore);
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
