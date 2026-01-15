export enum WidthStrategy {
    FULL_WIDTH = 'FULL_WIDTH',
    CUSTOM = 'CUSTOM',
}

export interface AdaptiveBannerConfig {
    enabled: boolean;
    type?: string;
    widthStrategy?: WidthStrategy;
    customWidth?: number;
    maxHeight?: number;
    orientationHandling?: string;
    includeReservationSizes?: boolean;
}

export interface GamConfig {
    adUnitPath: string;
    adSizes: string[];
    adaptiveBannerConfig?: AdaptiveBannerConfig;
}

export interface PrebidConfig {
    placementId: string;
    adSizes: string[];
}


export interface AdConfig {
    adType: string;
    refreshTimeSeconds?: number;
}

export interface RemoteAdConfiguration {
    id: string;
    config: AdConfig;
    gamConfig: GamConfig;
    prebidConfig: PrebidConfig;
}

export interface PrebidServer {
    url: string;
    accountId: string;
    statusUrl: string;
}

 * Supply chain(SCHAIN) configuration
    */
export interface Schain {
    sellerId: string;
    advertisingSystemDomain: string;
}

export interface OrtbConfig {
    schain?: Schain;
    publisherName?: string;
    domain?: string;
}

export interface AppOrtbConfig {
    bundleId?: string;
    sourceApp?: string;
    storeUrl?: string;
}

export interface IosConfig {
    ortb?: AppOrtbConfig;
}

export interface RemotePublisherConfiguration {
    id: number;
    prebidServer: PrebidServer;
    ortb?: OrtbConfig;
    ios?: IosConfig;
}
