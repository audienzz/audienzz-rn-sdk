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

#import "RCTOriginalBannerView.h"
#import "AUConverter.h"
#import <GoogleMobileAds/GoogleMobileAds.h>
#import <AudienzziOSSDK/AudienzziOSSDK-Swift.h>

@implementation RCTOriginalBannerView

- (void)setAutoRefreshPeriodMillis:(NSNumber *)value {
  _autoRefreshPeriodMillis = [value floatValue];
  self.propsChanged = YES;
}

- (void)setSizes:(NSArray *)sizes {
  _sizes = sizes;
  [self setNeedsLayout];
  self.propsChanged = YES;
}

- (void)setVideoPlacement:(NSString *)value {
  _videoPlacement = value;
  self.propsChanged = YES;
}

- (void)stopAutoRefresh {
  [_auBannerView.adUnitConfiguration stopAutoRefresh];
}

- (void)resumeAutoRefresh {
  [_auBannerView.adUnitConfiguration resumeAutoRefresh];
}

- (NSArray<NSValue *> *)convertSizesToGADAdSizes:(NSArray *)sizes {
    NSMutableArray<NSValue *> *gadAdSizes = [[NSMutableArray alloc] init];
    
    for (NSDictionary *sizeDict in sizes) {
        if ([sizeDict isKindOfClass:[NSDictionary class]]) {
            NSNumber *width = sizeDict[@"width"];
            NSNumber *height = sizeDict[@"height"];
            
            if (width && height) {
                GADAdSize gadAdSize = GADAdSizeFromCGSize(CGSizeMake([width floatValue], [height floatValue]));
                [gadAdSizes addObject:NSValueFromGADAdSize(gadAdSize)];
            }
        }
    }
    
    return [gadAdSizes copy];
}

- (NSArray<NSValue *> *)convertSizesToCGSizeArray:(NSArray *)sizes startingFromIndex:(NSUInteger)startIndex {
    NSMutableArray<NSValue *> *cgSizes = [[NSMutableArray alloc] init];
    
    for (NSUInteger i = startIndex; i < sizes.count; i++) {
        NSDictionary *sizeDict = sizes[i];
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
  GAMRequest *request = [GAMRequest request];
  
  if (self.isAdaptive && _sizes && _sizes.count > 0) {
          NSDictionary *firstSize = _sizes[0];
          if ([firstSize isKindOfClass:[NSDictionary class]]) {
              NSNumber *width = firstSize[@"width"];
              NSNumber *height = firstSize[@"height"];
              
              if (width && height) {
                  GADAdSize gadAdSize = GADInlineAdaptiveBannerAdSizeWithWidthAndMaxHeight([width floatValue], [height floatValue]);
                  _bannerView = [[GAMBannerView alloc] initWithAdSize:gadAdSize];
              }
          }
      } else if (_sizes && _sizes.count > 0) {
          NSArray<NSValue *> *gadAdSizes = [self convertSizesToGADAdSizes:_sizes];
          
          if (gadAdSizes.count > 0) {
              GADAdSize primarySize = GADAdSizeFromNSValue(gadAdSizes[0]);
              _bannerView = [[GAMBannerView alloc] initWithAdSize:primarySize];
              _bannerView.validAdSizes = gadAdSizes;
          }
      }
      
      if (!_bannerView) {
          NSLog(@"Failed to create banner view - no valid sizes provided");
          return;
      }
      
      CGSize adSize = CGSizeZero;
      if (_sizes && _sizes.count > 0) {
          NSDictionary *firstSize = _sizes[0];
          if ([firstSize isKindOfClass:[NSDictionary class]]) {
              NSNumber *width = firstSize[@"width"];
              NSNumber *height = firstSize[@"height"];
              
              if (width && height) {
                  adSize = CGSizeMake([width floatValue], [height floatValue]);
              }
          }
      }
  
  _auBannerView = [[AUBannerView alloc] initWithConfigId:self.auConfigID adSize:adSize adFormats:[AUConverter convertToAUAdFormats:self.adFormats] isLazyLoad:self.isLazyLoad];
  
  [self.videoParameters setPlacement:[AUConverter convertToAUPlacement:_videoPlacement]];
  
  if (_autoRefreshPeriodMillis > 0) {
    [_auBannerView.adUnitConfiguration setAutoRefreshMillisWithTime:_autoRefreshPeriodMillis];
  }
  if(self.pbAdSlot != nil) {
    [_auBannerView.adUnitConfiguration setAdSlot:self.pbAdSlot];
  }
  if(self.gpID != nil) {
    [_auBannerView.adUnitConfiguration setGPID:self.gpID];
  }
  if(self.impOrtbConfig != nil){
    [_auBannerView setImpOrtbConfigWithOrtbConfig:self.impOrtbConfig];
  }
  
  NSArray<NSValue *> *cgSizeArray = [self convertSizesToCGSizeArray:_sizes startingFromIndex:1];
  [self.bannerParameters setAdSizes: cgSizeArray];
  [_auBannerView addAdditionalSizeWithSizes: cgSizeArray];
  _auBannerView.bannerParameters = self.bannerParameters;
  _auBannerView.videoParameters = self.videoParameters;
  
  _bannerView.rootViewController = [[[[UIApplication sharedApplication] delegate] window] rootViewController];
  _bannerView.delegate = self;
  _bannerView.adUnitID = self.adUnitID;
  
  AUBannerEventHandler *eventHandler = [[AUBannerEventHandler alloc] initWithAdUnitId:self.adUnitID gamView:_bannerView];
  [_auBannerView createAdWith:request gamBanner:_bannerView eventHandler:eventHandler];

  void (^onLoadRequest)(id) = ^(id gamRequest) {
    if (![request isKindOfClass:[GAMRequest class]]) {
      NSLog(@"Failed request unwrap");
      return;
    }
    [self.bannerView loadRequest:request];
  };

  _auBannerView.onLoadRequest = onLoadRequest;
  
  _auBannerView.frame = CGRectMake(0, 0, adSize.width, adSize.height);
  [self addSubview:_auBannerView];
  [super layoutSubviews];
}

#pragma mark - GADBannerViewDelegate
- (void)bannerViewDidReceiveAd:(GADBannerView *)bannerView {
    if (self.onAdLoaded) {
        self.onAdLoaded(@{
            @"width": @(bannerView.adSize.size.width),
            @"height": @(bannerView.adSize.size.height)
        });
    }
}

- (void)bannerViewDidRecordClick:(GADBannerView *)bannerView {
  if (self.onAdClicked) {
    self.onAdClicked(@{});
  }
}

- (void)bannerViewWillPresentScreen:(GADBannerView *)bannerView {
  if (self.onAdOpened) {
    self.onAdOpened(@{});
  }
}

- (void)bannerViewDidDismissScreen:(GADBannerView *)bannerView {
  if (self.onAdClosed) {
    self.onAdClosed(@{});
  }
}

- (void)bannerView:(GADBannerView *)bannerView didFailToReceiveAdWithError:(NSError *)error {
  [self.auBannerView removeFromSuperview];
  self.auBannerView = nil;
  
  if (self.onAdFailedToLoad) {
    self.onAdFailedToLoad(@{@"code": @(error.code), @"message": [error localizedDescription]});
  }
}

@end
