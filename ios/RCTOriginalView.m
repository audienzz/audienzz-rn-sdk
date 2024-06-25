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

#import "RCTOriginalView.h"
#import "AUConverter.h"
#import "Utils.h"
#import <AudienzziOSSDK/AudienzziOSSDK-Swift.h>

@implementation RCTOriginalView

- (instancetype)init {
    self = [super init];
    
    _backgroundQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
    _semaphore = dispatch_semaphore_create(0);
    
    return self;
}

- (void)didSetProps:(NSArray<NSString *> *)value {
    if (_propsChanged) {
        dispatch_async(self.backgroundQueue, ^{
            [self createAd];
        });
    }
    _propsChanged = NO;
}

- (void)setPlaybackMethod:(NSArray<NSString *> *)value {
    _playbackMethod = value;
    _propsChanged = YES;
}

- (void)setIsLazyLoad:(NSNumber *)value {
    _isLazyLoad = [value boolValue];
    _propsChanged = YES;
}

- (void)setAdFormats:(NSArray<NSString *> *)value {
    _adFormats = value;
    _propsChanged = YES;
}

- (void)setApiParameters:(NSArray<NSString *> *)value {
    _apiParameters = value;
    _propsChanged = YES;
}

- (void)setVideoProtocols:(NSArray<NSString *> *)value {
    _videoProtocols = value;
    _propsChanged = YES;
}

- (void)setVideoBitrate:(NSArray<NSNumber *> *)value {
    _videoBitrate = value;
    _propsChanged = YES;
}

- (void)setVideoDuration:(NSArray<NSNumber *> *)value {
    _videoDuration = value;
    _propsChanged = YES;
}

- (void)setKeyword:(NSString *)value {
    _keyword = value;
    _propsChanged = YES;
}

- (void)setKeywords:(NSArray<NSString *> *)value {
    _keywords = value;
    _propsChanged = YES;
}

- (void)setAppContent:(NSDictionary *)value {
    AUMORTBAppContent *appContent = [Utils createContentObjectFromDictionary:value];
    _appContent = appContent;
    _propsChanged = YES;
}

- (void)setPbAdSlot:(NSString *)value {
    _pbAdSlot = value;
    _propsChanged = YES;
}

- (void)setGpID:(NSString *)value {
    _gpID = value;
    _propsChanged = YES;
}

- (void)setAuConfigID:(NSString *)value {
    _auConfigID = value;
    _propsChanged = YES;
}

- (void)setAdUnitID:(NSString *)value {
    _adUnitID = value;
    _propsChanged = YES;
}

- (void)createAd {}

- (void)internalCreateAd {
    NSMutableArray<AUVideoPlaybackMethod *> *playbackMethodArray = [NSMutableArray array];
    NSMutableArray<AUApi *> *apiArray = [NSMutableArray array];
    NSMutableArray<AUVideoProtocols *> *protocolArray = [NSMutableArray array];
    
    _bannerParameters = [[AUBannerParameters alloc] init];
    _videoParameters = [[AUVideoParameters alloc] initWithMimes:@[@"video/mp4"]];
    
    for (NSString *playbackMethodString in _playbackMethod) {
        AUVideoPlaybackMethod *playbackMethod = [AUConverter convertToAUPlaybackMethod:playbackMethodString];
        if (playbackMethod) {
            [playbackMethodArray addObject:playbackMethod];
        }
    }
    for (NSString *apiString in _apiParameters) {
        AUApi *api = [AUConverter convertToAUApi:apiString];
        if (api) {
            [apiArray addObject:api];
        }
    }
    for (NSString *protocolString in _videoProtocols) {
        AUVideoProtocols *protocol = [AUConverter convertToAUProtocols:protocolString];
        if (protocol) {
            [protocolArray addObject:protocol];
        }
    }
    
    _bannerParameters.api = [apiArray copy];
    _videoParameters.api = [apiArray copy];
    _videoParameters.protocols = [protocolArray copy];
    _videoParameters.playbackMethod = [playbackMethodArray copy];
    [_videoParameters setMinBitrate:_videoBitrate[0]];
    [_videoParameters setMaxBitrate:_videoBitrate[1]];
    [_videoParameters setMinDuration:_videoDuration[0]];
    [_videoParameters setMaxDuration:_videoDuration[1]];
}

@end

