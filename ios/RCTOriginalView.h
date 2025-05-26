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

#import <GoogleMobileAds/GoogleMobileAds.h>
#import <AudienzziOSSDK/AudienzziOSSDK-Swift.h>

@interface RCTOriginalView : UIView <GADBannerViewDelegate, GADFullScreenContentDelegate, AUInterstitialenderingAdDelegate, AURewardedAdUnitDelegate, AUBannerRenderingAdDelegate>

- (void)createAd;
- (void)internalCreateAd;

@property (nonatomic, strong) dispatch_semaphore_t semaphore;
@property (nonatomic, strong) dispatch_queue_t backgroundQueue;
@property(nonatomic, strong) AUBannerParameters *bannerParameters;
@property(nonatomic, strong) AUVideoParameters *videoParameters;
@property(nonatomic, assign) BOOL isLazyLoad;
@property(nonatomic, assign) BOOL isAdaptive;
@property(nonatomic, copy) NSArray<NSString *> *adFormats;
@property(nonatomic, copy) NSArray<NSString *> *playbackMethod;
@property(nonatomic, copy) NSArray<NSString *> *apiParameters;
@property(nonatomic, copy) NSArray<NSString *> *videoProtocols;
@property(nonatomic, copy) NSArray<NSNumber *> *videoBitrate;
@property(nonatomic, copy) NSArray<NSNumber *> *videoDuration;
@property(nonatomic, copy) NSString *pbAdSlot;
@property(nonatomic, copy) NSString *gpID;
@property(nonatomic, copy) NSString *adUnitID;
@property(nonatomic, copy) NSString *auConfigID;
@property(nonatomic, assign) BOOL propsChanged;

@end
