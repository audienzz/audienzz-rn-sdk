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

#import "RCTOriginalRewardedViewManager.h"
#import "RCTOriginalRewardedView.h"
#import <React/RCTViewManager.h>

@implementation RCTOriginalRewardedViewManager

RCT_EXPORT_MODULE(RCTOriginalRewardedView)

- (UIView *)view {
    return [[RCTOriginalRewardedView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(isLazyLoad, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(playbackMethod, NSArray)
RCT_EXPORT_VIEW_PROPERTY(apiParameters, NSArray)
RCT_EXPORT_VIEW_PROPERTY(videoProtocols, NSArray)
RCT_EXPORT_VIEW_PROPERTY(videoBitrate, NSArray)
RCT_EXPORT_VIEW_PROPERTY(videoDuration, NSArray)
RCT_EXPORT_VIEW_PROPERTY(keyword, NSString)
RCT_EXPORT_VIEW_PROPERTY(keywords, NSArray)
RCT_EXPORT_VIEW_PROPERTY(appContent, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(pbAdSlot, NSString)
RCT_EXPORT_VIEW_PROPERTY(gpID, NSString)
RCT_EXPORT_VIEW_PROPERTY(adUnitID, NSString)
RCT_EXPORT_VIEW_PROPERTY(auConfigID, NSString)
RCT_EXPORT_VIEW_PROPERTY(onRewardEarned, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdLoaded, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdFailedToLoad, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdClicked, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdOpened, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdClosed, RCTBubblingEventBlock)

@end
