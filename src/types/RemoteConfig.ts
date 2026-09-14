import type { AdError } from './Types';
import type { AdEvents } from './AdEvents';
import type { StyleProp, ViewStyle } from 'react-native';

export interface RemoteConfigBannerProps extends AdEvents {
  adConfigId: string;
  style?: StyleProp<ViewStyle>;
}

export interface RemoteConfigInterstitialProps
  extends Omit<AdEvents, 'onAdLoaded' | 'onAdFailedToLoad'> {
  adConfigId: string;
  /** Opt in to explicit preload/show commands. Keep stable for this component's lifetime. */
  manualControl?: boolean;
  onAdLoaded?(): void;
  onAdFailedToLoad?(error: AdError & { domain?: string }): void;
  onAdFailedToShow?(error: AdError & { domain?: string }): void;
  onLifecycleEvent?(event: {
    event: string;
    reason?: string | null;
    loadId?: string | null;
    configId?: string | null;
    timestampMillis?: number | null;
    loadAgeMillis?: number | null;
    responseId?: string | null;
  }): void;
}
