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

- (void)createAd {
  dispatch_semaphore_wait(self.semaphore, dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)));
  
  dispatch_async(dispatch_get_main_queue(), ^{
    [self internalCreateAd];
  });
}

- (void)internalCreateAd {
  [super internalCreateAd];
  
  GADRequest *request = [GADRequest request];
  
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
  NSLog(@"Failed to present interstitial ad with error: %@", error.localizedDescription);
}

- (void)adWillPresentFullScreenContent:(nonnull id<GADFullScreenPresentingAd>)ad {
  [UIApplication.sharedApplication setStatusBarHidden:YES];
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
  
  [UIApplication.sharedApplication setStatusBarHidden:NO];
  if (self.onAdClosed) {
    self.onAdClosed(@{});
  }
}

- (void)adDidDismissFullScreenContent:(nonnull id<GADFullScreenPresentingAd>)ad {
  NSLog(@"Ad did dismiss full screen content.");
}

@end
