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

#import "AUConverter.h"

@implementation AUConverter

+ (NSArray<AUAdFormat *> *)convertToAUAdFormats:(NSArray<NSString *> *)adFormats {
    NSMutableArray<AUAdFormat *> *auAdFormats = [NSMutableArray array];
    
    for (NSString *formatString in adFormats) {
        if ([formatString isEqualToString:@"banner"]) {
            [auAdFormats addObject:AUAdFormat.banner];
        } else if ([formatString isEqualToString:@"video"]) {
            [auAdFormats addObject:AUAdFormat.video];
        }
    }

    return [auAdFormats copy];
}

+ (AUApi *)convertToAUApi:(NSString *)apiString {
    if ([apiString isEqualToString:@"MRAID_1"]) {
        return [[AUApi alloc] initWithApiType:AUApiTypeMRAID_1];
    } else if ([apiString isEqualToString:@"MRAID_2"]) {
        return [[AUApi alloc] initWithApiType:AUApiTypeMRAID_2];
    } else if ([apiString isEqualToString:@"MRAID_3"]) {
        return [[AUApi alloc] initWithApiType:AUApiTypeMRAID_3];
    } else if ([apiString isEqualToString:@"VPAID_1"]) {
        return [[AUApi alloc] initWithApiType:AUApiTypeVPAID_1];
    } else if ([apiString isEqualToString:@"VPAID_2"]) {
        return [[AUApi alloc] initWithApiType:AUApiTypeVPAID_2];
    } else if ([apiString isEqualToString:@"OMID_1"]) {
        return [[AUApi alloc] initWithApiType:AUApiTypeOMID_1];
    } else if ([apiString isEqualToString:@"ORMMA"]) {
        return [[AUApi alloc] initWithApiType:AUApiTypeORMMA];
    }
    
    return nil;
}

+ (AUVideoProtocols *)convertToAUProtocols:(NSString *)protocolString {
    if ([protocolString isEqualToString:@"VAST_1_0"]) {
        return [[AUVideoProtocols alloc] initWithType:AUVideoProtocolsTypeVAST_1_0];
    } else if ([protocolString isEqualToString:@"VAST_2_0"]) {
        return [[AUVideoProtocols alloc] initWithType:AUVideoProtocolsTypeVAST_2_0];
    } else if ([protocolString isEqualToString:@"VAST_3_0"]) {
        return [[AUVideoProtocols alloc] initWithType:AUVideoProtocolsTypeVAST_3_0];
    } else if ([protocolString isEqualToString:@"VAST_4_0"]) {
        return [[AUVideoProtocols alloc] initWithType:AUVideoProtocolsTypeVAST_4_0];
    } else if ([protocolString isEqualToString:@"DAAST_1_0"]) {
        return [[AUVideoProtocols alloc] initWithType:AUVideoProtocolsTypeDAAST_1_0];
    } else if ([protocolString isEqualToString:@"VAST_1_0_Wrapped"]) {
        return [[AUVideoProtocols alloc] initWithType:AUVideoProtocolsTypeVAST_1_0_Wrapped];
    } else if ([protocolString isEqualToString:@"VAST_2_0_Wrapped"]) {
        return [[AUVideoProtocols alloc] initWithType:AUVideoProtocolsTypeVAST_2_0_Wrapped];
    } else if ([protocolString isEqualToString:@"VAST_3_0_Wrapped"]) {
        return [[AUVideoProtocols alloc] initWithType:AUVideoProtocolsTypeVAST_3_0_Wrapped];
    } else if ([protocolString isEqualToString:@"VAST_4_0_Wrapped"]) {
        return [[AUVideoProtocols alloc] initWithType:AUVideoProtocolsTypeVAST_4_0_Wrapped];
    } else if ([protocolString isEqualToString:@"DAAST_1_0_Wrapped"]) {
        return [[AUVideoProtocols alloc] initWithType:AUVideoProtocolsTypeDAAST_1_0_Wrapped];
    }
    
    return nil;
}

+ (AUVideoPlaybackMethod *)convertToAUPlaybackMethod:(NSString *)playbackMethodString {
    if ([playbackMethodString isEqualToString:@"AutoPlaySoundOn"]) {
        return [[AUVideoPlaybackMethod alloc] initWithType:AUVideoPlaybackMethodTypeAutoPlaySoundOn];
    } else if ([playbackMethodString isEqualToString:@"AutoPlaySoundOff"]) {
        return [[AUVideoPlaybackMethod alloc] initWithType:AUVideoPlaybackMethodTypeAutoPlaySoundOff];
    } else if ([playbackMethodString isEqualToString:@"ClickToPlay"]) {
        return [[AUVideoPlaybackMethod alloc] initWithType:AUVideoPlaybackMethodTypeClickToPlay];
    } else if ([playbackMethodString isEqualToString:@"MouseOver"]) {
        return [[AUVideoPlaybackMethod alloc] initWithType:AUVideoPlaybackMethodTypeMouseOver];
    } else if ([playbackMethodString isEqualToString:@"EnterSoundOn"]) {
        return [[AUVideoPlaybackMethod alloc] initWithType:AUVideoPlaybackMethodTypeEnterSoundOn];
    } else if ([playbackMethodString isEqualToString:@"EnterSoundOff"]) {
        return [[AUVideoPlaybackMethod alloc] initWithType:AUVideoPlaybackMethodTypeEnterSoundOff];
    }
    
    return nil;
}

+ (AUPlacement)convertToAUPlacement:(NSString *)placementString {
    if ([placementString isEqualToString:@"inArticle"]) {
        return AUPlacementInArticle;
    } else if ([placementString isEqualToString:@"inFeed"]) {
        return AUPlacementInFeed;
    } else if ([placementString isEqualToString:@"interstitial"]) {
        return AUPlacementInterstitial;
    } else {
        return AUPlacementInBanner;
    }
}

+ (AURenderingInsterstitialAdFormat)adFormatFromString:(NSString *)string {
    if ([string isEqualToString:@"banner"]) {
        return AURenderingInsterstitialAdFormatBanner;
    } else {
        return AURenderingInsterstitialAdFormatVideo;
    }
}

+ (AUAdFormat *)adFormatForBanner:(NSString *)string {
    if ([string isEqualToString:@"banner"]) {
        return [AUAdFormat banner];
    } else {
        return [AUAdFormat video];
    }
}

@end
