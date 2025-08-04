import NativeModulesCombined from './NativeRNAudienzzModule';
import type { AudienzzExternalUserId, IRNAudienzzTargetingModule } from './types';
import type { AudienzzLocation } from './types/IRNAudienzzTargetingModule';

class RNTargetingClass implements IRNAudienzzTargetingModule {
  setUserLatLng(latitude: number, longitude: number): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setUserLatLng(
      latitude,
      longitude
    );
  }
  clearUserLatLng(): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.clearUserLatLng();
  }
  getUserLatLng(): Promise<AudienzzLocation | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getUserLatLng();
  }
  setPublisherName(name: string | null): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setPublisherName(name);
  }
  getPublisherName(): Promise<string | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getPublisherName();
  }
  setDomain(domain: string): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setDomain(domain);
  }
  getDomain(): Promise<string> {
    return NativeModulesCombined.AudienzzTargetingModule.getDomain();
  }
  setStoreUrl(url: string): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setStoreUrl(url);
  }
  getStoreUrl(): Promise<string> {
    return NativeModulesCombined.AudienzzTargetingModule.getStoreUrl();
  }
  setBundleName(bundleName: string | null): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setBundleName(bundleName);
  }
  getBundleName(): Promise<string | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getBundleName();
  }
  setOmidPartnerName(name: string | null): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setOmidPartnerName(name);
  }
  getOmidPartnerName(): Promise<string | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getOmidPartnerName();
  }
  setOmidPartnerVersion(version: string | null): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setOmidPartnerVersion(version);
  }
  getOmidPartnerVersion(): Promise<string | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getOmidPartnerVersion();
  }
  setSubjectToCOPPA(isSubject: boolean | null): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setSubjectToCOPPA(isSubject);
  }
  getSubjectToCOPPA(): Promise<boolean | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getSubjectToCOPPA();
  }
  setSubjectToGDPR(isSubject: boolean | null): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setSubjectToGDPR(isSubject);
  }
  getSubjectToGDPR(): Promise<boolean | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getSubjectToGDPR();
  }
  setGDPRConsentString(consent: string | null): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setGDPRConsentString(consent);
  }
  getGDPRConsentString(): Promise<string | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getGDPRConsentString();
  }
  setPurposeConsents(consents: string | null): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setPurposeConsents(consents);
  }
  getPurposeConsents(): Promise<string | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getPurposeConsents();
  }
  getDeviceAccessConsent(): Promise<boolean | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getDeviceAccessConsent();
  }
  getUserKeywords(): Promise<string | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getUserKeywords();
  }
  getKeywordSet(): Promise<string[]> {
    return NativeModulesCombined.AudienzzTargetingModule.getKeywordSet();
  }
  addUserKeyword(keyword: string): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.addUserKeyword(keyword);
  }
  addUserKeywords(keywords: string[]): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.addUserKeywords(keywords);
  }
  removeUserKeyword(keyword: string): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.removeUserKeyword(keyword);
  }
  clearUserKeywords(): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.clearUserKeywords();
  }
  setExternalUserIds(userIds: AudienzzExternalUserId[] | null): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setExternalUserIds(userIds);
  }
  getExternalUserIds(): Promise<AudienzzExternalUserId[] | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getExternalUserIds();
  }
  getExtDataDictionary(): Promise<Record<string, string[]>> {
    return NativeModulesCombined.AudienzzTargetingModule.getExtDataDictionary();
  }
  addExtData(key: string, value: string): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.addExtData(key, value);
  }
  updateExtData(key: string, values: string[]): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.updateExtData(key, values);
  }
  removeExtData(key: string): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.removeExtData(key);
  }
  clearExtData(): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.clearExtData();
  }
  getAccessControlList(): Promise<string[]> {
    return NativeModulesCombined.AudienzzTargetingModule.getAccessControlList();
  }
  addBidderToAccessControlList(bidderName: string): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.addBidderToAccessControlList(
      bidderName
    );
  }
  removeBidderFromAccessControlList(bidderName: string): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.removeBidderFromAccessControlList(
      bidderName
    );
  }
  clearAccessControlList(): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.clearAccessControlList();
  }
  addGlobalTargeting(key: string, value: string): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.addGlobalTargeting(key, value);
  }
  addGlobalTargetingSet(key: string, values: string[]): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.addGlobalTargetingSet(
      key,
      values
    );
  }
  removeGlobalTargeting(key: string): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.removeGlobalTargeting(key);
  }
  clearGlobalTargeting(): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.clearGlobalTargeting();
  }
  getGlobalOrtbConfig(): Promise<string | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getGlobalOrtbConfig();
  }
  setGlobalOrtbConfig(ortbConfig: string): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setGlobalOrtbConfig(
      ortbConfig
    );
  }
  setSourceapp(sourceapp: string | null): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setSourceapp(sourceapp);
  }
  getSourceapp(): Promise<string | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getSourceapp();
  }
  setItunesID(itunesID: string | null): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setItunesID(itunesID);
  }
  getItunesID(): Promise<string | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getItunesID();
  }
  setContentUrl(url: string | null): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setContentUrl(url);
  }
  getContentUrl(): Promise<string | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getContentUrl();
  }
  setLocation(
    latitude: number,
    longitude: number,
    accuracy: number
  ): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setLocation(
      latitude,
      longitude,
      accuracy
    );
  }
  getLocation(): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getLocation();
  }
  addUserData(key: string, value: string): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.addUserData(key, value);
  }
  updateUserData(key: string, values: string[]): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.updateUserData(key, values);
  }
  getAppKeywords(): Promise<string[]> {
    return NativeModulesCombined.AudienzzTargetingModule.getAppKeywords();
  }
  addAppKeyword(keyword: string): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.addAppKeyword(keyword);
  }
  addAppKeywords(keywords: string[]): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.addAppKeywords(keywords);
  }
  removeAppKeyword(keyword: string): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.removeAppKeyword(keyword);
  }
  clearAppKeywords(): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.clearAppKeywords();
  }
  setUserExt(userExt: Record<string, any> | null): Promise<void> {
    return NativeModulesCombined.AudienzzTargetingModule.setUserExt(userExt);
  }
  getUserExt(): Promise<Record<string, any> | null> {
    return NativeModulesCombined.AudienzzTargetingModule.getUserExt();
  }
}

const Instance = new RNTargetingClass();

export const RNTargeting = () => {
  return Instance;
};

export default RNTargeting;
