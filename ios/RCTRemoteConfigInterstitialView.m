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
#import <React/UIView+React.h>

@implementation RCTRemoteConfigInterstitialView {
  NSString *_appliedConfig;
  BOOL _appliedManualControl;
  BOOL _disposed;
  BOOL _loading;
  BOOL _presenting;
  NSUInteger _generation;
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps { [self createAd]; }

- (void)releaseOwner {
  _generation++;
  _loading = NO;
  _presenting = NO;
  self.auRemoteConfigInterstitial.delegate = nil;
  self.auRemoteConfigInterstitial.onPresentationError = nil;
  self.auRemoteConfigInterstitial.onLifecycleEvent = nil;
  [self.auRemoteConfigInterstitial destroy];
  self.auRemoteConfigInterstitial = nil;
}

- (void)createAd {
  if (_disposed) return;
  if ((_appliedConfig == self.adConfigId || [_appliedConfig isEqualToString:self.adConfigId]) &&
      _appliedManualControl == self.manualControl) return;
  [self releaseOwner];
  _appliedConfig = [self.adConfigId copy];
  _appliedManualControl = self.manualControl;
  if (self.adConfigId.length == 0) return;
  self.auRemoteConfigInterstitial = [[AURemoteConfigInterstitial alloc] initWithAdConfigId:self.adConfigId];
  self.auRemoteConfigInterstitial.delegate = self;
  NSUInteger token = _generation;
  __weak typeof(self) weakSelf = self;
  self.auRemoteConfigInterstitial.onPresentationError = ^(NSError *error) {
    typeof(self) self = weakSelf;
    if (!self || self->_disposed || token != self->_generation) return;
    self->_presenting = NO;
    NSDictionary *payload = [self errorPayload:error];
    if (self.onAdFailedToShow) self.onAdFailedToShow(payload);
    else if (!self.manualControl && self.onAdFailedToLoad) self.onAdFailedToLoad(payload);
  };
  self.auRemoteConfigInterstitial.onLifecycleEvent = ^(NSDictionary *event) {
    typeof(self) self = weakSelf;
    if (!self || self->_disposed || token != self->_generation) return;
    if ([event[@"event"] isEqual:@"showAttempted"]) self->_presenting = YES;
    if (self.onLifecycleEvent) self.onLifecycleEvent(event);
  };
  if (!self.manualControl) [self load];
}

- (NSDictionary *)errorPayload:(NSError *)error {
  return @{@"code": @(error.code), @"message": error.localizedDescription, @"domain": error.domain};
}

- (UIViewController *)presentationController {
  return [self reactViewController] ?: self.window.rootViewController;
}

- (void)load { if (!self.manualControl) [self startLoad:NO]; }
- (void)preload { if (self.manualControl) [self startLoad:YES]; }

- (void)startLoad:(BOOL)preload {
  if (_disposed || _loading || _presenting || self.auRemoteConfigInterstitial.isReady) return;
  if (!self.auRemoteConfigInterstitial) {
    if (self.onAdFailedToLoad) self.onAdFailedToLoad(@{@"code": @(-1), @"message": @"adConfigId is required", @"domain": @"Audienzz"});
    return;
  }
  _loading = YES;
  self.auRemoteConfigInterstitial.presentationViewController = [self presentationController];
  NSUInteger token = _generation;
  __weak typeof(self) weakSelf = self;
  void (^completion)(NSError *) = ^(NSError *error) {
    typeof(self) self = weakSelf;
    if (!self || self->_disposed || token != self->_generation) return;
    self->_loading = NO;
    if (error) {
      if (self.onAdFailedToLoad) self.onAdFailedToLoad([self errorPayload:error]);
    } else if (self.onAdLoaded) self.onAdLoaded(@{});
  };
  if (preload) [self.auRemoteConfigInterstitial preloadWithCompletion:completion];
  else [self.auRemoteConfigInterstitial loadWithCompletion:completion];
}

- (void)showAtOpportunity:(BOOL)eligible {
  if (!_disposed && self.manualControl) [self showOnce:eligible];
}
- (void)show { if (!_disposed) [self showOnce:YES]; }

- (void)showOnce:(BOOL)eligible {
  UIViewController *controller = [self presentationController];
  if (!controller) {
    if (self.onLifecycleEvent) self.onLifecycleEvent(@{@"event": @"opportunitySkipped", @"reason": @"inactive", @"configId": self.adConfigId ?: @""});
    return;
  }
  [self.auRemoteConfigInterstitial showAtOpportunityFrom:controller eligible:eligible];
}

- (void)dispose {
  if (_disposed) return;
  _disposed = YES;
  [self releaseOwner];
}
// Paper calls invalidate when purging a view; Fabric interop releases its paper view.
- (void)invalidate { [self dispose]; }
- (void)dealloc { [self releaseOwner]; }

- (void)adDidRecordClick:(id<GADFullScreenPresentingAd>)ad {
  if (!_disposed && self.onAdClicked) self.onAdClicked(@{});
}
- (void)adDidRecordImpression:(id<GADFullScreenPresentingAd>)ad {
  if (!_disposed && self.onAdImpression) self.onAdImpression(@{});
}
- (void)adWillPresentFullScreenContent:(id<GADFullScreenPresentingAd>)ad {
  if (!_disposed && self.onAdOpened) self.onAdOpened(@{});
}
- (void)adDidDismissFullScreenContent:(id<GADFullScreenPresentingAd>)ad {
  _presenting = NO;
  if (!_disposed && self.onAdClosed) self.onAdClosed(@{});
}
@end
