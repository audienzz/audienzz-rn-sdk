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

#import "RCTOriginalInterstitialView.h"
#import "AUConverter.h"
#import <GoogleMobileAds/GoogleMobileAds.h>
#import <AudienzziOSSDK/AudienzziOSSDK-Swift.h>

@interface RCTOriginalInterstitialView ()
/// What the current interstitial was built for. A prop change that does not change it reuses the
/// ad already held instead of buying another one.
@property(nonatomic, copy) NSString *loadedIdentity;
@end

@implementation RCTOriginalInterstitialView {
  AUAdRequestContext *_requestContext;
}

- (void)setMinSizesPercentage:(NSArray<NSNumber *> *)value {
  _minSizesPercentage = value;
  self.propsChanged = YES;
}

- (void)setSizes:(NSArray *)sizes {
    _sizes = sizes;
    self.propsChanged = YES;
}

// Merges the sizes into the publisher's impOrtbConfig as `banner.format` (the Prebid #1135
// workaround) instead of replacing it: overwriting it dropped the publisher's deals, floors and
// first-party data whenever `sizes` was set. Returns nil when there are no valid sizes; the
// caller then leaves the publisher's config as it is.
- (NSString *)mergeBannerFormatIntoOrtbConfig:(NSString *)existingConfig sizes:(NSArray *)sizes {
    NSMutableArray *formatArray = [[NSMutableArray alloc] init];
    for (NSDictionary *sizeDict in sizes) {
        if ([sizeDict isKindOfClass:[NSDictionary class]]) {
            NSNumber *width = sizeDict[@"width"];
            NSNumber *height = sizeDict[@"height"];
            if (width && height) {
                [formatArray addObject:@{@"w": @([width intValue]), @"h": @([height intValue])}];
            }
        }
    }
    if (formatArray.count == 0) {
        return nil;
    }

    NSMutableDictionary *root = nil;
    if (existingConfig.length > 0) {
        NSData *data = [existingConfig dataUsingEncoding:NSUTF8StringEncoding];
        id parsed = [NSJSONSerialization JSONObjectWithData:data
                                                    options:NSJSONReadingMutableContainers
                                                      error:nil];
        if ([parsed isKindOfClass:[NSDictionary class]]) {
            root = [parsed mutableCopy];
        }
    }
    if (root == nil) {
        root = [NSMutableDictionary dictionary];
    }
    id existingBanner = root[@"banner"];
    NSMutableDictionary *banner = [existingBanner isKindOfClass:[NSDictionary class]]
        ? [existingBanner mutableCopy] : [NSMutableDictionary dictionary];
    banner[@"format"] = formatArray;
    root[@"banner"] = banner;

    NSData *outData = [NSJSONSerialization dataWithJSONObject:root options:0 error:nil];
    return outData ? [[NSString alloc] initWithData:outData encoding:NSUTF8StringEncoding] : existingConfig;
}

- (NSArray<NSValue *> *)convertSizesToCGSizeArray:(NSArray *)sizes {
    NSMutableArray<NSValue *> *cgSizes = [[NSMutableArray alloc] init];
    
    for (NSDictionary *sizeDict in sizes) {
        if ([sizeDict isKindOfClass:[NSDictionary class]]) {
            NSNumber *width = sizeDict[@"width"];
            NSNumber *height = sizeDict[@"height"];
            
            if (width && height) {
                CGSize cgSize = CGSizeMake([width floatValue], [height floatValue]);
                [cgSizes addObject:[NSValue valueWithCGSize:cgSize]];
            }
        }
    }
    
    return [cgSizes copy];
}

/// React Native releases the view when the component unmounts; without this the interstitial and
/// its Prebid ad unit outlived it.
- (void)dealloc {
  [_auInterstitialView destroy];
}

- (void)createAd {
  dispatch_semaphore_wait(self.semaphore, dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)));
  
  dispatch_async(dispatch_get_main_queue(), ^{
    [self internalCreateAd];
  });
}

- (void)internalCreateAd {
  [super internalCreateAd];

  // Props land incrementally and creation runs on a debounce: without both identifiers this would
  // build an ad from empty defaults. Not recorded as loaded, so the next prop transaction retries.
  if (self.adUnitID.length == 0 || self.auConfigID.length == 0) {
    NSLog(@"[Audienzz] Interstitial ad creation skipped — adUnitID/auConfigID not ready");
    return;
  }

  // didSetProps fires on every prop change, and each run used to allocate another
  // AUInterstitialView, add it as a subview and start its own auction — so a handful of prop
  // updates bought a handful of interstitials, only one of which could ever be shown. Keep the ad
  // we already have unless the placement itself changed.
  NSString *identity = [NSString stringWithFormat:@"%@|%@", self.auConfigID ?: @"", self.adUnitID ?: @""];
  if (_auInterstitialView != nil && [identity isEqualToString:self.loadedIdentity]) {
    return;
  }
  if (_auInterstitialView != nil) {
    [_auInterstitialView destroy];
    [_auInterstitialView removeFromSuperview];
    _auInterstitialView = nil;
  }
  self.loadedIdentity = identity;

  GAMRequest *request = [GAMRequest request];
  
  // Formats and API frameworks are backend-controlled: a hand-built interstitial asks for banner
  // and video with MRAID 1/2/3 + OMID 1, whatever is set on it.
  _auInterstitialView = [[AUInterstitialView alloc] initWithConfigId:self.auConfigID isLazyLoad:self.isLazyLoad minWidthPerc:[_minSizesPercentage[0] integerValue] minHeightPerc:[_minSizesPercentage[1] integerValue]];
  if (!_requestContext) _requestContext = [AUAdRequestContext new];
  self.auInterstitialView.requestContext = _requestContext;
  
  if(self.pbAdSlot != nil) {
    [_auInterstitialView.adUnitConfiguration setAdSlot:self.pbAdSlot];
  }
  if(self.gpID != nil) {
    [_auInterstitialView.adUnitConfiguration setGPID:self.gpID];
  }
  if(self.impOrtbConfig != nil){
    [_auInterstitialView setImpOrtbConfigWithOrtbConfig:self.impOrtbConfig];
  }
  
  //TODO: remove hack when fixed - https://github.com/prebid/prebid-mobile-ios/issues/1135
      if (_sizes && _sizes.count > 0) {
          NSString *ortbConfig = [self mergeBannerFormatIntoOrtbConfig:self.impOrtbConfig sizes:_sizes];
          NSArray<NSValue *> *cgSizeArray = [self convertSizesToCGSizeArray:_sizes];
          [self.bannerParameters setAdSizes: cgSizeArray];
          if (ortbConfig) {
              [_auInterstitialView setImpOrtbConfigWithOrtbConfig:ortbConfig];
          }
      }
  
  _auInterstitialView.bannerParameters = self.bannerParameters;
  // An interstitial's video is an interstitial placement, as the native default describes it;
  // the shared view leaves placement unset, so bidders were told nothing about the slot.
  [self.videoParameters setPlacement:AUPlacementInterstitial];
  [self.videoParameters setPlcmnt:AUPlcmntInterstitial];
  _auInterstitialView.videoParameters = self.videoParameters;
  _auInterstitialView.frame = CGRectMake(0, 0, 10, 10);
  
  [self addSubview:_auInterstitialView];

  // Installed BEFORE createAdWith:, which issues the first request itself when not lazy.
  __weak typeof(self) weakSelf = self;
  _auInterstitialView.onLoadRequest = ^(id _Nonnull request) {
    __strong typeof(weakSelf) self = weakSelf;
    if (self == nil) {
      return;
    }
    if (![request isKindOfClass:[GADRequest class]]) {
      NSLog(@"Failed request unwrap");
      return;
    }
    
    [GADInterstitialAd loadWithAdUnitID:self.adUnitID request:request completionHandler:^(GADInterstitialAd *ad, NSError *error) {
      if (error) {
        [self.auInterstitialView removeFromSuperview];
        self.auInterstitialView = nil;
        
        if (self.onAdFailedToLoad) {
          self.onAdFailedToLoad(@{@"code": @(error.code), @"message": [error localizedDescription]});
        }
        return;
      } else {
        if (self.onAdLoaded) {
          self.onAdLoaded(@{});
        }
      }
      ad.fullScreenContentDelegate = self;
      
      AUInterstitialEventHandler *eventHandler = [[AUInterstitialEventHandler alloc] initWithAdUnit:ad];
      [self.auInterstitialView connectHandler:eventHandler];
      
      [ad presentFromRootViewController:nil];
    }];
  };

  [_auInterstitialView createAdWith:request adUnitID:self.adUnitID];

}

#pragma mark - GADFullScreenContentDelegate

- (void)ad:(nonnull id<GADFullScreenPresentingAd>)ad
didFailToPresentFullScreenContentWithError:(nonnull NSError *)error {
  // Surfaced, not only logged: a bid won and then not shown has to be observable.
  [self.auInterstitialView removeFromSuperview];
  self.auInterstitialView = nil;
  if (self.onAdFailedToShow) {
    self.onAdFailedToShow(@{@"code": @(error.code), @"message": [error localizedDescription]});
  }
}

- (void)adWillPresentFullScreenContent:(nonnull id<GADFullScreenPresentingAd>)ad {
  if (self.onAdOpened) {
    self.onAdOpened(@{});
  }
}

- (void)adDidRecordClick:(nonnull id<GADFullScreenPresentingAd>)ad {
  if (self.onAdClicked) {
    self.onAdClicked(@{});
  }
}

- (void)adWillDismissFullScreenContent:(nonnull id<GADFullScreenPresentingAd>)ad {
  [self.auInterstitialView removeFromSuperview];
  self.auInterstitialView = nil;

  if (self.onAdClosed) {
    self.onAdClosed(@{});
  }
}

- (void)adDidDismissFullScreenContent:(nonnull id<GADFullScreenPresentingAd>)ad {
  NSLog(@"Ad did dismiss full screen content.");
}

@end
