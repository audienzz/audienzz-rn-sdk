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

#import "RCTRemoteConfigBannerViewManager.h"
#import "RCTRemoteConfigBannerView.h"
#import <React/RCTUIManager.h>
#import <React/RCTViewManager.h>

@implementation RCTRemoteConfigBannerViewManager

RCT_EXPORT_MODULE(RNRemoteConfigBanner)

- (UIView *)view {
  return [[RCTRemoteConfigBannerView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(pageKey, NSString)
RCT_EXPORT_VIEW_PROPERTY(adConfigId, NSString)
RCT_EXPORT_VIEW_PROPERTY(onAdLoaded, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdSizeChanged, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdClicked, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdOpened, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdClosed, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdFailedToLoad, RCTBubblingEventBlock)

RCT_EXPORT_METHOD(reload:(nonnull NSNumber *)reactTag) {
    dispatch_async(dispatch_get_main_queue(), ^{
        RCTUIManager *uiManager = self.bridge.uiManager;
        UIView *view = [uiManager viewForReactTag:reactTag];
        if ([view isKindOfClass:[RCTRemoteConfigBannerView class]]) {
            [(RCTRemoteConfigBannerView *)view reloadIfVisible];
        }
    });
}

RCT_EXPORT_METHOD(stopAutoRefresh:(nonnull NSNumber *)reactTag) {
    dispatch_async(dispatch_get_main_queue(), ^{
        RCTUIManager *uiManager = self.bridge.uiManager;
        UIView *view = [uiManager viewForReactTag:reactTag];
        if ([view isKindOfClass:[RCTRemoteConfigBannerView class]]) {
            [(RCTRemoteConfigBannerView *)view stopAutoRefresh];
        }
    });
}

RCT_EXPORT_METHOD(setCovered:(nonnull NSNumber *)reactTag covered:(BOOL)covered) {
    dispatch_async(dispatch_get_main_queue(), ^{
        RCTUIManager *uiManager = self.bridge.uiManager;
        UIView *view = [uiManager viewForReactTag:reactTag];
        if ([view isKindOfClass:[RCTRemoteConfigBannerView class]]) {
            [(RCTRemoteConfigBannerView *)view setCovered:covered];
        }
    });
}

RCT_EXPORT_METHOD(resumeAutoRefresh:(nonnull NSNumber *)reactTag) {
    dispatch_async(dispatch_get_main_queue(), ^{
        RCTUIManager *uiManager = self.bridge.uiManager;
        UIView *view = [uiManager viewForReactTag:reactTag];
        if ([view isKindOfClass:[RCTRemoteConfigBannerView class]]) {
            [(RCTRemoteConfigBannerView *)view resumeAutoRefresh];
        }
    });
}

@end
