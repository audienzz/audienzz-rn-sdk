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

#import "RCTRenderingBannerView.h"
#import "AUConverter.h"
#import <GoogleMobileAds/GoogleMobileAds.h>
#import <AudienzziOSSDK/AudienzziOSSDK-Swift.h>

@implementation RCTRenderingBannerView

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

- (void)setAdFormat:(NSString *)value{
    _adFormat = value;
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
    CGSize adSize = CGSizeMake(_width, _height);
    
    _eventHandler = [[AUGAMBannerEventHandler alloc] initWithAdUnitID:self.adUnitID
                                                                              validGADAdSizes:@[[NSValue valueWithBytes:&GADAdSizeMediumRectangle objCType:@encode(GADAdSize)]]];
    
    _auBannerView = [[AUBannerRenderingView alloc] initWithConfigId:self.auConfigID adSize:adSize format:[AUConverter adFormatForBanner:_adFormat] isLazyLoad:self.isLazyLoad eventHandler:_eventHandler];
    
    [self.videoParameters setPlacement:AUPlacementInBanner];
    
    if(self.pbAdSlot != nil) {
        [_auBannerView.adUnitConfiguration setAdSlot:self.pbAdSlot];
    }
    if(self.gpID != nil) {
        [_auBannerView.adUnitConfiguration setGPID:self.gpID];
    }

    _auBannerView.videoParameters = self.videoParameters;
    
    _auBannerView.delegate = self;
    [_auBannerView createAd];
    
    _auBannerView.frame = CGRectMake(0, 0, self.width, self.height);
    [self addSubview:_auBannerView];
    [super layoutSubviews];
}

#pragma mark - AUBannerRenderingAdDelegate

- (void)bannerAdDidDisplayOnScreen {}

- (UIViewController *)bannerViewPresentationController {
    UIResponder *responder = self;
    while ([responder isKindOfClass:[UIView class]]) {
        responder = [responder nextResponder];
    }
    return (UIViewController *)responder;
}

- (void)bannerView:(AUBannerRenderingView * _Nonnull)bannerView didReceiveAdWithAdSize:(CGSize)adSize {
    if (self.onAdLoaded) {
        self.onAdLoaded(@{});
    }
}

- (void)bannerView:(AUBannerRenderingView * _Nonnull)bannerView didFailToReceiveAdWith:(NSError * _Nonnull)error {
    [self.auBannerView removeFromSuperview];
    self.auBannerView = nil;
    
    if (self.onAdFailedToLoad) {
        self.onAdFailedToLoad(@{@"code": @(error.code), @"message": [error localizedDescription]});
    }
}

- (void)bannerViewWillLeaveApplication:(AUBannerRenderingView * _Nonnull)bannerView {}

- (void)bannerViewWillPresentModal:(AUBannerRenderingView * _Nonnull)bannerView {
    if (self.onAdOpened) {
        self.onAdOpened(@{});
    }
}

- (void)bannerViewDidDismissModal:(AUBannerRenderingView * _Nonnull)bannerView {
    if (self.onAdClosed) {
        self.onAdClosed(@{});
    }
}

@end
