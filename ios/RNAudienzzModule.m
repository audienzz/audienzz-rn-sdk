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

#import "RNAudienzzModule.h"
// RCTBridgeModule.h only forward-declares RCTBridge; -enqueueJSCall: needs the full definition.
#import <React/RCTBridge.h>
#import <AudienzziOSSDK/AudienzziOSSDK-Swift.h>
#import <GoogleMobileAds/GoogleMobileAds.h>

static NSString * const kRNSdkVersion = @"0.5.0";

@implementation RNAudienzzModule

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

// Forward every native page impression to JS -- including the automatic one fired on returning to
// the foreground, which never passes through the JS API. Native owns foreground reporting; JS just
// page-scopes the ad types the native coordinator doesn't track (rendering banners).
- (void)setBridge:(RCTBridge *)bridge {
  _bridge = bridge;
  __weak __typeof(self) weakSelf = self;
  [Audienzz shared].pageImpressionObserver = ^(NSString *name) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [weakSelf.bridge enqueueJSCall:@"RCTDeviceEventEmitter"
                              method:@"emit"
                                args:@[ @"AudienzzPageImpression", name ?: @"" ]
                          completion:NULL];
    });
  };
}

RCT_EXPORT_METHOD(initialize: (NSString *)companyId
                    resolver: (RCTPromiseResolveBlock)resolve
                    rejecter: (RCTPromiseRejectBlock)reject) {
  [self initializeWithCompanyId:companyId
                       resolver:resolve
                       rejecter:reject];
}

RCT_EXPORT_METHOD(setSchainObject: (NSString *)schain
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject) {
  [self setSchainObjectWithSchain:schain resolver:resolve rejecter:reject];
}

- (void)initializeWithCompanyId:(NSString *)companyId
                       resolver:(RCTPromiseResolveBlock)resolve
                       rejecter:(RCTPromiseRejectBlock)reject {
  [[Audienzz shared]
      configureSDK_RNWithCompanyId:companyId
                        completion:^{
                          NSDictionary *result = @{
                            @"status" : @"SUCCEEDED",
                            @"description" : @"SDK initialized successfully!"
                          };

                          resolve(result);
                        }];
  [[AudienzzGAMUtils shared] initializeGAM];
  [[AUTargeting shared] setBridgeTargetingWithKey:@"au_rn_v" value:kRNSdkVersion];
}

- (void)setSchainObjectWithSchain:(NSString *)schain
                         resolver:(RCTPromiseResolveBlock)resolve
                         rejecter:(RCTPromiseRejectBlock)reject {

  [[Audienzz shared] setSchainObjectWithSchain:schain];
  resolve(nil);
}

// Supply a publisher-owned PPID (e.g. a hashed e-mail). Takes precedence over the
// SDK-generated one; pass null to clear and fall back to it. A PPID is always
// sent -- there is no opt-out.
RCT_EXPORT_METHOD(setPublisherPpid: (nullable NSString *)ppid) {
  [[PPIDManager shared] setPublisherPPID:ppid];
}

// One greppable AUDZ line per slot decision; see AUDiagnostics.
RCT_EXPORT_METHOD(setDiagnosticsEnabled: (BOOL)enabled) {
  [[Audienzz shared] setDiagnosticsEnabled:enabled];
}

// Force smart-refresh v2 on/off, overriding the backend smartRefreshV2 config for the session.
// v2 uses the directional viewport gate; v1 uses the legacy >=20%-visible gate.
RCT_EXPORT_METHOD(setSmartRefreshV2Enabled: (BOOL)enabled) {
  // The Swift property is a tri-state `Bool?`, which Objective-C cannot see; the SDK exposes this
  // setter for it.
  [[Audienzz shared] setSmartRefreshV2Override:enabled];
}

// When true, a banner blanks its slot during a screen-resume reload.
RCT_EXPORT_METHOD(setBlankOnScreenReload: (BOOL)enabled) {
  [Audienzz shared].blankOnScreenReload = enabled;
}

// Global GMA ad audio volume for all ad types. Clamped to [0,1]; 0 = muted.
RCT_EXPORT_METHOD(setAppVolume: (float)volume) {
  [[Audienzz shared] setAppVolume:volume];
}

// Report an ad-bearing screen, dialog, or popup by name (your JS navigation route). Fires a
// pageImpression and starts a fresh page-impression id tying all ad events on this visit together.
RCT_EXPORT_METHOD(pageImpression: (NSString *)name) {
  [[Audienzz shared] pageImpressionWithName:name];
}

// Report a page whose identity and analytics name differ. Every React Native ad lives in the one
// host view controller, so host identity can never separate two routes — the id is the only thing
// that can, and a screen name repeats (two articles are both "article").
RCT_EXPORT_METHOD(pageImpressionWithId: (NSString *)pageId name: (NSString *)name) {
  [[Audienzz shared] pageImpressionWithPageId:pageId name:name];
}

RCT_EXPORT_METHOD(getPpid: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject) {
  NSString *ppid = [[PPIDManager shared] getPPID];
  resolve(ppid);
}

RCT_EXPORT_METHOD(configureRemote : (NSString *)remoteUrl publisherId : (
    NSString *)publisherId resolver : (RCTPromiseResolveBlock)
                      resolve rejecter : (RCTPromiseRejectBlock)reject) {
  NSURL *url = [NSURL URLWithString:remoteUrl];

  if (url == nil) {
    reject(@"INVALID_URL", @"Invalid remote URL provided", nil);
    return;
  }

  [[AudienzzRemoteConfig shared] configureRemoteWithRemoteUrl:url
                                                  publisherId:publisherId];
  resolve(nil);
}

RCT_EXPORT_METHOD(fetchPublisherConfig: (NSString *)publisherId
                              resolver: (RCTPromiseResolveBlock)resolve
                              rejecter: (RCTPromiseRejectBlock)reject) {
  // GMAS removed the `sdkVersion` string; build it from `versionNumber`.
  GADVersionNumber gamVersionNumber = [GADMobileAds sharedInstance].versionNumber;
  NSString *gamVersion = [NSString stringWithFormat:@"%ld.%ld.%ld",
                          (long)gamVersionNumber.majorVersion,
                          (long)gamVersionNumber.minorVersion,
                          (long)gamVersionNumber.patchVersion];
  [[Audienzz shared]
      configureWithRemoteSDKWithGadMobileAdsVersion:gamVersion
                        completionHandler:^(NSError *_Nullable error) {
                          if (error != nil) {
                            reject(@"FETCH_FAILED",
                                   [error localizedDescription], error);
                          } else {
                            [[AudienzzGAMUtils shared] initializeGAM];
                            [[AUTargeting shared] setBridgeTargetingWithKey:@"au_rn_v" value:kRNSdkVersion];
                            resolve(nil);
                          }
                        }];
}

RCT_EXPORT_METHOD(getStickyConfig: (NSString *)adConfigId
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject) {
  CGFloat maxH = [[AudienzzRemoteConfig shared] stickyMaxHeightForAdConfigId:adConfigId];
  CGFloat topOff = [[AudienzzRemoteConfig shared] stickyTopOffsetForAdConfigId:adConfigId];
  resolve(@{@"maxHeight": @(maxH), @"stickyTopOffset": @(topOff)});
}

@end
