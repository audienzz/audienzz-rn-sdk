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

#import "RCTOriginalBannerView.h"
#import "AUConverter.h"
#import <GoogleMobileAds/GoogleMobileAds.h>
#import <AudienzziOSSDK/AudienzziOSSDK-Swift.h>

@implementation RCTOriginalBannerView

- (void)setAutoRefreshPeriodMillis:(NSNumber *)value {
    _autoRefreshPeriodMillis = [value floatValue];
    self.propsChanged = YES;
}

- (void)setWidth:(NSNumber *)value {
    _width = [value floatValue];
    [self setNeedsLayout];
    self.propsChanged = YES;
}

- (void)setHeight:(NSNumber *)value {
    _height = [value floatValue];
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

- (void)createAd {
    dispatch_semaphore_wait(self.semaphore, dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)));
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self internalCreateAd];
    });
}

- (void)internalCreateAd {
    [super internalCreateAd];
    
    GAMRequest *request = [GAMRequest request];
    CGSize adSize = CGSizeMake(_width, _height);
    
    _bannerView = [[GAMBannerView alloc] initWithAdSize:GADAdSizeFromCGSize(adSize)];
    _auBannerView = [[AUBannerView alloc] initWithConfigId:self.auConfigID adSize:adSize adFormats:[AUConverter convertToAUAdFormats:self.adFormats] isLazyLoad:self.isLazyLoad];
    
    [self.videoParameters setPlacement:[AUConverter convertToAUPlacement:_videoPlacement]];
    
    if (_autoRefreshPeriodMillis > 0) {
        [_auBannerView.adUnitConfiguration setAutoRefreshMillisWithTime:_autoRefreshPeriodMillis];
    }
    if(self.keyword != nil) {
        [_auBannerView.adUnitConfiguration addExtKeyword:self.keyword];
    }
    if(self.keywords != nil) {
        NSSet<NSString *> *keywordsSet = [NSSet setWithArray:self.keywords];
        [_auBannerView.adUnitConfiguration addExtKeywords:keywordsSet];
    }
    if(self.pbAdSlot != nil) {
        [_auBannerView.adUnitConfiguration setAdSlot:self.pbAdSlot];
    }
    if(self.gpID != nil) {
        [_auBannerView.adUnitConfiguration setGPID:self.gpID];
    }
    if(self.appContent != nil) {
        [_auBannerView.adUnitConfiguration setAppContent:self.appContent];
    }
    
    _auBannerView.bannerParameters = self.bannerParameters;
    _auBannerView.parameters = self.videoParameters;
    
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
    
    _auBannerView.frame = CGRectMake(0, 0, self.width, self.height);
    [self addSubview:_auBannerView];
    [super layoutSubviews];
}

#pragma mark - GADBannerViewDelegate

- (void)bannerViewDidReceiveAd:(GADBannerView *)bannerView {
    if (self.onAdLoaded) {
        self.onAdLoaded(@{});
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
