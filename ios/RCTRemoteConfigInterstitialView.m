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
  AUAdRequestContext *_requestContext;
  NSString *_appliedConfig;
  BOOL _appliedManualControl;
  BOOL _disposed;
  BOOL _loading;
  BOOL _presenting;
  NSUInteger _generation;
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps { [self createAd]; }

- (void)releaseOwner {
  [self releaseOwnerWithReason:@"disposed"];
}

/// `reason` records why held inventory is being released: a prop change that swaps placements is a
/// replacement, an unmount is a disposal. Only the reported reason differs.
- (void)releaseOwnerWithReason:(NSString *)reason {
  AURemoteConfigInterstitial *owner = self.auRemoteConfigInterstitial;
  if (owner == nil) {
    _generation++;
    _loading = NO;
    _presenting = NO;
    return;
  }
  RCTBubblingEventBlock lifecycle = self.onLifecycleEvent;
  // Bumping first stops load/presentation callbacks reaching JS as spurious failures: every one of
  // those blocks is generation-gated.
  _generation++;
  _loading = NO;
  _presenting = NO;
  owner.delegate = nil;
  owner.onPresentationError = nil;
  // But destroy() is also what reports inventory discarded without an impression, and clearing
  // this callback before destroying swallowed exactly the event this teardown should surface. An
  // ungated forwarder is installed across the call and removed straight after.
  owner.onLifecycleEvent = ^(NSDictionary *event) {
    if (lifecycle) lifecycle(event);
  };
  // destroyWithReason:, not destroy: — Swift exports `destroy(reason:)` with the argument label
  // folded into the selector. Verified against the generated AudienzziOSSDK-Swift.h.
  [owner destroyWithReason:reason];
  owner.onLifecycleEvent = nil;
  self.auRemoteConfigInterstitial = nil;
}

- (void)createAd {
  if (_disposed) return;
  if ((_appliedConfig == self.adConfigId || [_appliedConfig isEqualToString:self.adConfigId]) &&
      _appliedManualControl == self.manualControl) return;
  [self releaseOwnerWithReason:@"replaced"];
  _appliedConfig = [self.adConfigId copy];
  _appliedManualControl = self.manualControl;
  if (self.adConfigId.length == 0) return;
  self.auRemoteConfigInterstitial = [[AURemoteConfigInterstitial alloc] initWithAdConfigId:self.adConfigId];
  if (!_requestContext) _requestContext = [AUAdRequestContext new];
  self.auRemoteConfigInterstitial.requestContext = _requestContext;
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
  // manualControl == NO means "prefetch and show as soon as this component mounts": the convenience
  // form, spelled out rather than hidden behind a load that sometimes presents.
  if (!self.manualControl) [self prefetchAndShow];
}

- (NSDictionary *)errorPayload:(NSError *)error {
  return @{@"code": @(error.code), @"message": error.localizedDescription, @"domain": error.domain};
}

- (UIViewController *)presentationController {
  return [self reactViewController] ?: self.window.rootViewController;
}

- (void)prefetch { [self startLoad:NO]; }
- (void)prefetchAndShow { [self startLoad:YES]; }

- (void)startLoad:(BOOL)showWhenLoaded {
  if (_disposed) return;
  if (!self.auRemoteConfigInterstitial) {
    if (self.onAdFailedToLoad) self.onAdFailedToLoad(@{@"code": @(-1), @"message": @"adConfigId is required", @"domain": @"Audienzz"});
    return;
  }
  // Deliberately NOT short-circuited on ready / loading / presenting. Native owns those
  // decisions: a ready owner answers a prefetchAndShow by presenting immediately, a load in
  // flight is joined (and a presentation may be added to it), and a rejected call reports its
  // own failure. Returning here threw the request away — `prefetchAndShow()` on a ready or
  // loading owner did nothing at all, silently.
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
  if (showWhenLoaded) {
    UIViewController *controller = [self presentationController];
    if (!controller) {
      self->_loading = NO;
      if (self.onAdFailedToLoad) self.onAdFailedToLoad(@{@"code": @(-1), @"message": @"No view controller to present from", @"domain": @"Audienzz"});
      return;
    }
    [self.auRemoteConfigInterstitial prefetchAndShowWithCompletionFrom:controller completion:completion];
  } else {
    [self.auRemoteConfigInterstitial prefetchWithCompletion:completion];
  }
}

- (void)show:(BOOL)eligible {
  if (!_disposed) [self showOnce:eligible];
}

- (void)showOnce:(BOOL)eligible {
  UIViewController *controller = [self presentationController];
  if (!controller) {
    if (self.onLifecycleEvent) self.onLifecycleEvent(@{@"event": @"opportunitySkipped", @"reason": @"inactive", @"configId": self.adConfigId ?: @""});
    return;
  }
  [self.auRemoteConfigInterstitial showFrom:controller eligible:eligible];
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
