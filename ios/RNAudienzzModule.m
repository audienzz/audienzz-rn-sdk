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
#import <AudienzziOSSDK/AudienzziOSSDK-Swift.h>

@implementation RNAudienzzModule

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

RCT_EXPORT_METHOD(initialize:(NSString *)companyId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self initializeWithCompanyId:companyId resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(setSchainObject:(NSString *)schain
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self setSchainObjectWithSchain:schain resolver:resolve rejecter:reject];
}

- (void)initializeWithCompanyId:(NSString *)companyId
                       resolver:(RCTPromiseResolveBlock)resolve
                       rejecter:(RCTPromiseRejectBlock)reject {
    [[Audienzz shared] configureSDK_RNWithCompanyId:companyId :^{
        NSDictionary *result = @{
            @"status" : @"SUCCEEDED",
            @"description" : @"SDK initialized successfully!"
        };
        
        resolve(result);
    }];
    [[AudienzzGAMUtils shared] initializeGAM];
}

- (void)setSchainObjectWithSchain:(NSString *)schain
                         resolver:(RCTPromiseResolveBlock)resolve
                         rejecter:(RCTPromiseRejectBlock)reject {

        [[Audienzz shared] setSchainObjectWithSchain:schain];
        
  resolve(nil);
}


@end
