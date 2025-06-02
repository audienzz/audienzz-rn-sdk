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

#import <React/RCTComponent.h>
#import "RCTOriginalView.h"

@interface RCTRenderingInterstitialView : RCTOriginalView

@property(nonatomic, strong) AUGAMInterstitialEventHandler *eventHandler;
@property(nonatomic, strong) AUInterstitialRenderingView *auInterstitialView;
@property(nonatomic, copy) NSString *adFormat;
@property(nonatomic, copy) NSArray<NSNumber *> *minSizesPercentage;
@property(nonatomic, assign) CGFloat skipDelay;
@property(nonatomic, copy) RCTBubblingEventBlock onAdLoaded;
@property(nonatomic, copy) RCTBubblingEventBlock onAdFailedToLoad;
@property(nonatomic, copy) RCTBubblingEventBlock onAdClicked;
@property(nonatomic, copy) RCTBubblingEventBlock onAdOpened;
@property(nonatomic, copy) RCTBubblingEventBlock onAdClosed;

@end
