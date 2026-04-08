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


/** Fallback refresh interval used when `refreshTimeSeconds` is absent or null
 *  in the remote payload. Matches the default on Android, iOS, and Flutter. */
export const DEFAULT_REFRESH_TIME_SECONDS = 30;

export interface AdConfig {
    adType: string;
    /** Seconds between auto-refresh cycles.
     *  `undefined` when absent or null in the remote payload.
     *  The native SDK applies {@link DEFAULT_REFRESH_TIME_SECONDS} as a fallback. */
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
