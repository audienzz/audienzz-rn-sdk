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

#import "RCTRemoteConfigInterstitialViewManager.h"
#import "RCTRemoteConfigInterstitialView.h"
#import <React/RCTUIManager.h>
#import <React/RCTViewManager.h>

@implementation RCTRemoteConfigInterstitialViewManager

RCT_EXPORT_MODULE(RNRemoteConfigInterstitial)

- (UIView *)view {
  return [[RCTRemoteConfigInterstitialView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(adConfigId, NSString)
RCT_EXPORT_VIEW_PROPERTY(onAdLoaded, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdClicked, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdOpened, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdClosed, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdFailedToLoad, RCTBubblingEventBlock)

RCT_EXPORT_METHOD(load : (nonnull NSNumber *)reactTag) {
  dispatch_async(dispatch_get_main_queue(), ^{
    RCTUIManager *uiManager = self.bridge.uiManager;
    UIView *view = [uiManager viewForReactTag:reactTag];
    if ([view isKindOfClass:[RCTRemoteConfigInterstitialView class]]) {
      [(RCTRemoteConfigInterstitialView *)view load];
    }
  });
}

RCT_EXPORT_METHOD(show : (nonnull NSNumber *)reactTag) {
  dispatch_async(dispatch_get_main_queue(), ^{
    RCTUIManager *uiManager = self.bridge.uiManager;
    UIView *view = [uiManager viewForReactTag:reactTag];
    if ([view isKindOfClass:[RCTRemoteConfigInterstitialView class]]) {
      [(RCTRemoteConfigInterstitialView *)view show];
    }
  });
}

@end
