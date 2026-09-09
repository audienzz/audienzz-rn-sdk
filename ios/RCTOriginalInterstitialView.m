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

@implementation RCTOriginalInterstitialView

- (void)setMinSizesPercentage:(NSArray<NSNumber *> *)value {
  _minSizesPercentage = value;
  self.propsChanged = YES;
}

- (void)setSizes:(NSArray *)sizes {
    _sizes = sizes;
    self.propsChanged = YES;
}

// H4: merge the generated banner.format into the publisher's existing impOrtbConfig instead of
// replacing it, so customer deals/floors/first-party data set via impOrtbConfig survive the
// #1135 workaround. Returns nil when there are no valid sizes (caller then leaves the customer
// config untouched).
- (NSString *)mergeBannerFormatIntoOrtbConfig:(NSString *)existingConfig sizes:(NSArray *)sizes {
    NSMutableArray *formatArray = [[NSMutableArray alloc] init];

    for (NSDictionary *sizeDict in sizes) {
        if ([sizeDict isKindOfClass:[NSDictionary class]]) {
            NSNumber *width = sizeDict[@"width"];
            NSNumber *height = sizeDict[@"height"];

            if (width && height) {
                [formatArray addObject:@{@"w": width, @"h": height}];
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

    NSMutableDictionary *banner = nil;
    id existingBanner = root[@"banner"];
    if ([existingBanner isKindOfClass:[NSDictionary class]]) {
        banner = [existingBanner mutableCopy];
    } else {
        banner = [NSMutableDictionary dictionary];
    }
    banner[@"format"] = formatArray;
    root[@"banner"] = banner;

    NSData *outData = [NSJSONSerialization dataWithJSONObject:root options:0 error:nil];
    if (outData == nil) {
        return existingConfig;
    }

    return [[NSString alloc] initWithData:outData encoding:NSUTF8StringEncoding];
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

- (void)createAd {
  dispatch_semaphore_wait(self.semaphore, dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)));
  
  dispatch_async(dispatch_get_main_queue(), ^{
    [self internalCreateAd];
  });
}

- (void)internalCreateAd {
  [super internalCreateAd];

  // H3: bail if required identifiers haven't landed yet (props arrive incrementally on a
  // debounce) instead of building an ad with empty defaults.
  if (self.adUnitID.length == 0 || self.auConfigID.length == 0) {
    NSLog(@"[Audienzz] Interstitial ad creation skipped — adUnitID/auConfigID not ready");
    return;
  }

  GAMRequest *request = [GAMRequest request];
  
  _auInterstitialView = [[AUInterstitialView alloc] initWithConfigId:self.auConfigID adFormats:[AUConverter convertToAUAdFormats:self.adFormats] isLazyLoad:self.isLazyLoad minWidthPerc:[_minSizesPercentage[0] integerValue] minHeightPerc:[_minSizesPercentage[1] integerValue]];
  
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
          NSArray<NSValue *> *cgSizeArray = [self convertSizesToCGSizeArray:_sizes];
          [self.bannerParameters setAdSizes: cgSizeArray];
          // H4: merge, don't overwrite — preserves the publisher's impOrtbConfig set above.
          NSString *ortbConfig = [self mergeBannerFormatIntoOrtbConfig:self.impOrtbConfig sizes:_sizes];
          if (ortbConfig) {
              [_auInterstitialView setImpOrtbConfigWithOrtbConfig:ortbConfig];
          }
      }

  // H5: fullscreen interstitial video must be classified as interstitial placement, otherwise
  // the native default clobbers it to in-banner and video bid density drops.
  [self.videoParameters setPlacement:AUPlacementInterstitial];

  _auInterstitialView.bannerParameters = self.bannerParameters;
  _auInterstitialView.videoParameters = self.videoParameters;
  _auInterstitialView.frame = CGRectMake(0, 0, 10, 10);
  
  [self addSubview:_auInterstitialView];
  [_auInterstitialView createAdWith:request adUnitID:self.adUnitID];
  
  __weak typeof(self) weakSelf = self;
  _auInterstitialView.onLoadRequest = ^(id _Nonnull request) {
    __strong typeof(weakSelf) self = weakSelf;
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
}

#pragma mark - GADFullScreenContentDelegate

- (void)ad:(nonnull id<GADFullScreenPresentingAd>)ad
didFailToPresentFullScreenContentWithError:(nonnull NSError *)error {
  // H8: surface show failures to JS instead of only logging, and clean up the ad view so a
  // failed present doesn't leave a dangling 10x10 subview.
  [self.auInterstitialView removeFromSuperview];
  self.auInterstitialView = nil;

  if (self.onAdFailedToShow) {
    self.onAdFailedToShow(@{@"code": @(error.code), @"message": [error localizedDescription]});
  }
}

- (void)adWillPresentFullScreenContent:(nonnull id<GADFullScreenPresentingAd>)ad {
  // M5: dropped the deprecated -setStatusBarHidden: call. It is a no-op on scene-based apps and
  // triggers an App Store deprecation warning; GAM's own full-screen VC manages the status bar.
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

  // M5: dropped the deprecated -setStatusBarHidden: call (see adWillPresentFullScreenContent).
  if (self.onAdClosed) {
    self.onAdClosed(@{});
  }
}

- (void)adDidDismissFullScreenContent:(nonnull id<GADFullScreenPresentingAd>)ad {
  NSLog(@"Ad did dismiss full screen content.");
}

@end
