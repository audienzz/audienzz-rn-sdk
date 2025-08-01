#import "RNAudienzzTargetingModule.h"
#import <AudienzziOSSDK/AudienzziOSSDK-Swift.h>

@implementation RNAudienzzTargetingModule

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

RCT_EXPORT_METHOD(setOmidPartnerName:(NSString *)name) {
    [[AUTargeting shared] setOmidPartnerName:name];
}

RCT_EXPORT_METHOD(getOmidPartnerName:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *name = [[AUTargeting shared] omidPartnerName];
    resolve(name);
}

RCT_EXPORT_METHOD(setOmidPartnerVersion:(NSString *)version) {
    [[AUTargeting shared] setOmidPartnerVersion:version];
}

RCT_EXPORT_METHOD(getOmidPartnerVersion:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *version = [[AUTargeting shared] omidPartnerVersion];
    resolve(version);
}

RCT_EXPORT_METHOD(setPublisherName:(NSString *)name) {
    [[AUTargeting shared] setPublisherName:name];
}

RCT_EXPORT_METHOD(getPublisherName:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *name = [[AUTargeting shared] publisherName];
    resolve(name);
}

RCT_EXPORT_METHOD(setDomain:(NSString *)domain) {
    [[AUTargeting shared] setDomain:domain];
}

RCT_EXPORT_METHOD(getDomain:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *domain = [[AUTargeting shared] domain];
    resolve(domain);
}

RCT_EXPORT_METHOD(setStoreURL:(NSString *)url) {
    [[AUTargeting shared] setStoreURL:url];
}

RCT_EXPORT_METHOD(getStoreURL:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *url = [[AUTargeting shared] storeURL];
    resolve(url);
}

RCT_EXPORT_METHOD(setSourceapp:(NSString *)sourceapp) {
    [[AUTargeting shared] setSourceapp:sourceapp];
}

RCT_EXPORT_METHOD(getSourceapp:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *sourceapp = [[AUTargeting shared] sourceapp];
    resolve(sourceapp);
}

RCT_EXPORT_METHOD(setItunesID:(NSString *)itunesID) {
    [[AUTargeting shared] setItunesID:itunesID];
}

RCT_EXPORT_METHOD(getItunesID:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *itunesID = [[AUTargeting shared] itunesID];
    resolve(itunesID);
}

RCT_EXPORT_METHOD(setContentUrl:(NSString *)url) {
    [[AUTargeting shared] setContentUrl:url];
}

RCT_EXPORT_METHOD(getContentUrl:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *url = [[AUTargeting shared] contentUrl];
    resolve(url);
}

RCT_EXPORT_METHOD(setLatitude:(double)latitude longitude:(double)longitude) {
    [[AUTargeting shared] setLatitude:latitude longitude:longitude];
}

RCT_EXPORT_METHOD(setLocation:(double)latitude
                  longitude:(double)longitude
                  accuracy:(double)accuracy) {
    CLLocation *location = [[CLLocation alloc] initWithCoordinate:CLLocationCoordinate2DMake(latitude, longitude)
                                                         altitude:0
                                               horizontalAccuracy:accuracy
                                                 verticalAccuracy:0
                                                        timestamp:[NSDate date]];
    [[AUTargeting shared] setLocation:location];
}

RCT_EXPORT_METHOD(getLocation:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    CLLocation *location = [[AUTargeting shared] location];
    if (location) {
        NSDictionary *result = @{
            @"latitude": @(location.coordinate.latitude),
            @"longitude": @(location.coordinate.longitude),
            @"accuracy": @(location.horizontalAccuracy)
        };
        resolve(result);
    } else {
        resolve([NSNull null]);
    }
}

RCT_EXPORT_METHOD(setSubjectToCOPPA:(NSNumber *)isSubject) {
    [[AUTargeting shared] setCoppa:isSubject];
}

RCT_EXPORT_METHOD(getSubjectToCOPPA:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSNumber *coppa = [[AUTargeting shared] coppa];
    resolve(coppa);
}

RCT_EXPORT_METHOD(setSubjectToGDPR:(NSNumber *)isSubject) {
    [[AUTargeting shared] setSubjectToGDPR:isSubject];
}

RCT_EXPORT_METHOD(getSubjectToGDPR:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSNumber *gdpr = [[AUTargeting shared] getSubjectToGDPR];
    resolve(gdpr);
}

RCT_EXPORT_METHOD(setGdprConsentString:(NSString *)consent) {
    [[AUTargeting shared] setGdprConsentString:consent];
}

RCT_EXPORT_METHOD(getGdprConsentString:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *consent = [[AUTargeting shared] gdprConsentString];
    resolve(consent);
}

RCT_EXPORT_METHOD(setPurposeConsents:(NSString *)consents) {
    [[AUTargeting shared] setPurposeConsents:consents];
}

RCT_EXPORT_METHOD(getPurposeConsents:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *consents = [[AUTargeting shared] purposeConsents];
    resolve(consents);
}

RCT_EXPORT_METHOD(getDeviceAccessConsent:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSNumber *consent = [[AUTargeting shared] getDeviceAccessConsentObjc];
    resolve(consent);
}

RCT_EXPORT_METHOD(setExternalUserIds:(NSArray *)userIds) {
    [[AUTargeting shared] setEids:userIds];
}

RCT_EXPORT_METHOD(getExternalUserIds:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSArray *userIds = [[AUTargeting shared] getExternalUserIds];
    resolve(userIds ?: [NSNull null]);
}

RCT_EXPORT_METHOD(getUserKeywords:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSArray *keywords = [[AUTargeting shared] getUserKeywords];
    resolve(keywords);
}

RCT_EXPORT_METHOD(addUserKeyword:(NSString *)keyword) {
    [[AUTargeting shared] addUserKeyword:keyword];
}

RCT_EXPORT_METHOD(addUserKeywords:(NSArray *)keywords) {
    NSSet *keywordSet = [NSSet setWithArray:keywords];
    [[AUTargeting shared] addUserKeywords:keywordSet];
}

RCT_EXPORT_METHOD(removeUserKeyword:(NSString *)keyword) {
    [[AUTargeting shared] removeUserKeyword:keyword];
}

RCT_EXPORT_METHOD(clearUserKeywords) {
    [[AUTargeting shared] clearUserKeywords];
}

RCT_EXPORT_METHOD(getAppKeywords:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSArray *keywords = [[AUTargeting shared] getAppKeywords];
    resolve(keywords);
}

RCT_EXPORT_METHOD(addAppKeyword:(NSString *)keyword) {
    [[AUTargeting shared] addAppKeyword:keyword];
}

RCT_EXPORT_METHOD(addAppKeywords:(NSArray *)keywords) {
    NSSet *keywordSet = [NSSet setWithArray:keywords];
    [[AUTargeting shared] addAppKeywords:keywordSet];
}

RCT_EXPORT_METHOD(removeAppKeyword:(NSString *)keyword) {
    [[AUTargeting shared] removeAppKeyword:keyword];
}

RCT_EXPORT_METHOD(clearAppKeywords) {
    [[AUTargeting shared] clearAppKeywords];
}

RCT_EXPORT_METHOD(addUserData:(NSString *)key value:(NSString *)value) {
    [[AUTargeting shared] addUserDataWithKey:key value:value];
}

RCT_EXPORT_METHOD(updateUserData:(NSString *)key values:(NSArray *)values) {
    NSSet *valueSet = [NSSet setWithArray:values];
    [[AUTargeting shared] updateUserDataWithKey:key value:valueSet];
}

RCT_EXPORT_METHOD(getAppExtData:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSDictionary *extData = [[AUTargeting shared] getAppExtData];
    resolve(extData);
}

RCT_EXPORT_METHOD(addAppExtData:(NSString *)key value:(NSString *)value) {
    [[AUTargeting shared] addAppExtDataWithKey:key value:value];
}

RCT_EXPORT_METHOD(updateAppExtData:(NSString *)key values:(NSArray *)values) {
    NSSet *valueSet = [NSSet setWithArray:values];
    [[AUTargeting shared] updateAppExtDataWithKey:key value:valueSet];
}

RCT_EXPORT_METHOD(removeAppExtData:(NSString *)key) {
    [[AUTargeting shared] removeAppExtDataFor:key];
}

RCT_EXPORT_METHOD(clearAppExtData) {
    [[AUTargeting shared] clearAppExtData];
}

RCT_EXPORT_METHOD(getAccessControlList:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSArray *acl = [[AUTargeting shared] getAccessControlList];
    resolve(acl);
}

RCT_EXPORT_METHOD(addBidderToAccessControlList:(NSString *)bidderName) {
    [[AUTargeting shared] addBidderToAccessControlList:bidderName];
}

RCT_EXPORT_METHOD(removeBidderFromAccessControlList:(NSString *)bidderName) {
    [[AUTargeting shared] removeBidderFromAccessControlList:bidderName];
}

RCT_EXPORT_METHOD(clearAccessControlList) {
    [[AUTargeting shared] clearAccessControlList];
}

RCT_EXPORT_METHOD(addGlobalTargeting:(NSString *)key value:(NSString *)value) {
    [[AUTargeting shared] addGlobalTargetingWithKey:key value:value];
}

RCT_EXPORT_METHOD(addGlobalTargetingSet:(NSString *)key values:(NSArray *)values) {
    NSSet *valueSet = [NSSet setWithArray:values];
    [[AUTargeting shared] addGlobalTargetingWithKey:key values:valueSet];
}

RCT_EXPORT_METHOD(removeGlobalTargeting:(NSString *)key) {
    [[AUTargeting shared] removeGlobalTargetingWithKey:key];
}

RCT_EXPORT_METHOD(clearGlobalTargeting) {
    [[AUTargeting shared] clearGlobalTargeting];
}

RCT_EXPORT_METHOD(getGlobalOrtbConfig:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *config = [[AUTargeting shared] getGlobalOrtbConfig];
    resolve(config);
}

RCT_EXPORT_METHOD(setGlobalOrtbConfig:(NSString *)ortbConfig) {
    [[AUTargeting shared] setGlobalOrtbConfigWithOrtbConfig:ortbConfig];
}

RCT_EXPORT_METHOD(setUserExt:(NSDictionary *)userExt) {
    [[AUTargeting shared] setUserExt:userExt];
}

RCT_EXPORT_METHOD(getUserExt:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSDictionary *userExt = [[AUTargeting shared] userExt];
    resolve(userExt ?: [NSNull null]);
}

@end
