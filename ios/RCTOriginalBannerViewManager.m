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

#import "RCTOriginalBannerViewManager.h"
#import "RCTOriginalBannerView.h"
#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>

@implementation RCTOriginalBannerViewManager

RCT_EXPORT_MODULE(RCTOriginalBannerView)

- (UIView *)view {
    return [[RCTOriginalBannerView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(isLazyLoad, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(adFormats, NSArray)
RCT_EXPORT_VIEW_PROPERTY(playbackMethod, NSArray)
RCT_EXPORT_VIEW_PROPERTY(apiParameters, NSArray)
RCT_EXPORT_VIEW_PROPERTY(videoProtocols, NSArray)
RCT_EXPORT_VIEW_PROPERTY(videoPlacement, NSString)
RCT_EXPORT_VIEW_PROPERTY(videoBitrate, NSArray)
RCT_EXPORT_VIEW_PROPERTY(videoDuration, NSArray)
RCT_EXPORT_VIEW_PROPERTY(keyword, NSString)
RCT_EXPORT_VIEW_PROPERTY(keywords, NSArray)
RCT_EXPORT_VIEW_PROPERTY(appContent, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(pbAdSlot, NSString)
RCT_EXPORT_VIEW_PROPERTY(gpID, NSString)
RCT_EXPORT_VIEW_PROPERTY(adUnitID, NSString)
RCT_EXPORT_VIEW_PROPERTY(auConfigID, NSString)
RCT_EXPORT_VIEW_PROPERTY(width, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(height, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(autoRefreshPeriodMillis, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(onAdLoaded, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdClicked, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdOpened, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdClosed, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdFailedToLoad, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(isAdaptive, NSNumber)

RCT_EXPORT_METHOD(stopAutoRefresh:(nonnull NSNumber *)reactTag) {
    dispatch_async(dispatch_get_main_queue(), ^{
        RCTUIManager *uiManager = self.bridge.uiManager;
        UIView *view = [uiManager viewForReactTag:reactTag];
        if ([view isKindOfClass:[RCTOriginalBannerView class]]) {
            [(RCTOriginalBannerView *)view stopAutoRefresh];
        }
    });
}

RCT_EXPORT_METHOD(resumeAutoRefresh:(nonnull NSNumber *)reactTag) {
    dispatch_async(dispatch_get_main_queue(), ^{
        RCTUIManager *uiManager = self.bridge.uiManager;
        UIView *view = [uiManager viewForReactTag:reactTag];
        if ([view isKindOfClass:[RCTOriginalBannerView class]]) {
            [(RCTOriginalBannerView *)view resumeAutoRefresh];
        }
    });
}

@end
