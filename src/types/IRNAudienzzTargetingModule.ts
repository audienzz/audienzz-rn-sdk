export type AudienzzUniqueId = {
  id: string;
  atype?: number;
}

export type AudienzzExternalUserId = {
  source: string;
  uniqueIds: AudienzzUniqueId[];
}

export type AudienzzLocation = {
  latitude: number;
  longitude: number;
}

export interface IRNAudienzzTargetingModule {
      // Location
      setUserLatLng(latitude: number, longitude: number): Promise<void>;
      clearUserLatLng(): Promise<void>;
      getUserLatLng(): Promise<AudienzzLocation | null>;
      
      // Basic Properties
      setPublisherName(name: string | null): Promise<void>;
      getPublisherName(): Promise<string | null>;
      setDomain(domain: string): Promise<void>;
      getDomain(): Promise<string>;
      setStoreUrl(url: string): Promise<void>;
      getStoreUrl(): Promise<string>;
      setBundleName(bundleName: string | null): Promise<void>;
      getBundleName(): Promise<string | null>;
      
      // OMID Partners
      setOmidPartnerName(name: string | null): Promise<void>;
      getOmidPartnerName(): Promise<string | null>;
      setOmidPartnerVersion(version: string | null): Promise<void>;
      getOmidPartnerVersion(): Promise<string | null>;
      
      // COPPA and GDPR
      setSubjectToCOPPA(isSubject: boolean | null): Promise<void>;
      getSubjectToCOPPA(): Promise<boolean | null>;
      setSubjectToGDPR(isSubject: boolean | null): Promise<void>;
      getSubjectToGDPR(): Promise<boolean | null>;
      setGDPRConsentString(consent: string | null): Promise<void>;
      getGDPRConsentString(): Promise<string | null>;
      setPurposeConsents(consents: string | null): Promise<void>;
      getPurposeConsents(): Promise<string | null>;
      getDeviceAccessConsent(): Promise<boolean | null>;
      
      // Keywords
      getUserKeywords(): Promise<string | null>;
      getKeywordSet(): Promise<string[]>;
      addUserKeyword(keyword: string): Promise<void>;
      addUserKeywords(keywords: string[]): Promise<void>;
      removeUserKeyword(keyword: string): Promise<void>;
      clearUserKeywords(): Promise<void>;
      
      // External User IDs
      setExternalUserIds(userIds: AudienzzExternalUserId[] | null): Promise<void>;
      getExternalUserIds(): Promise<AudienzzExternalUserId[] | null>;
      
      // Ext Data
      getExtDataDictionary(): Promise<Record<string, string[]>>;
      addExtData(key: string, value: string): Promise<void>;
      updateExtData(key: string, values: string[]): Promise<void>;
      removeExtData(key: string): Promise<void>;
      clearExtData(): Promise<void>;
      
      // Access Control List
      getAccessControlList(): Promise<string[]>;
      addBidderToAccessControlList(bidderName: string): Promise<void>;
      removeBidderFromAccessControlList(bidderName: string): Promise<void>;
      clearAccessControlList(): Promise<void>;
      
      // Global Targeting
      addGlobalTargeting(key: string, value: string): Promise<void>;
      addGlobalTargetingSet(key: string, values: string[]): Promise<void>;
      removeGlobalTargeting(key: string): Promise<void>;
      clearGlobalTargeting(): Promise<void>;
      
      // ORTB Config
      getGlobalOrtbConfig(): Promise<string | null>;
      setGlobalOrtbConfig(ortbConfig: string): Promise<void>;
      
      // iOS-specific methods
      setSourceapp(sourceapp: string | null): Promise<void>;
      getSourceapp(): Promise<string | null>;
      setItunesID(itunesID: string | null): Promise<void>;
      getItunesID(): Promise<string | null>;
      setContentUrl(url: string | null): Promise<void>;
      getContentUrl(): Promise<string | null>;
      
      // Location with accuracy (iOS)
      setLocation(latitude: number, longitude: number, accuracy: number): Promise<void>;
      getLocation(): Promise<{ latitude: number; longitude: number; accuracy: number } | null>;
      
      // User Data
      addUserData(key: string, value: string): Promise<void>;
      updateUserData(key: string, values: string[]): Promise<void>;
      
      // App Keywords
      getAppKeywords(): Promise<string[]>;
      addAppKeyword(keyword: string): Promise<void>;
      addAppKeywords(keywords: string[]): Promise<void>;
      removeAppKeyword(keyword: string): Promise<void>;
      clearAppKeywords(): Promise<void>;
      
      // User Extensions
      setUserExt(userExt: Record<string, any> | null): Promise<void>;
      getUserExt(): Promise<Record<string, any> | null>;
}