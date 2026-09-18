import type { AdError } from './Types';
import type { AdEvents } from './AdEvents';
import type { StyleProp, ViewStyle } from 'react-native';

export interface RemoteConfigBannerProps extends AdEvents {
  adConfigId: string;
  style?: StyleProp<ViewStyle>;
  /**
   * Defer the auction until the slot approaches the viewport.
   *
   * Omitted (the default) defers to the ad config's `lazyLoad`, which itself falls back to
   * eager loading — the auction starts as soon as the banner mounts, wherever it sits.
   * `true` waits until the slot is within `prefetchMargin` of the viewport.
   *
   * Changing it remounts the underlying banner, so keep it stable for the component's lifetime
   * unless you mean to reload.
   */
  lazyLoad?: boolean;
  /**
   * How far ahead of the viewport the auction starts, in dp (Android) / points (iOS). Only has
   * an effect while `lazyLoad` is on. Omitted defers to the ad config's prefetch distance,
   * which itself falls back to 200.
   *
   * In a `FlatList` this is usually the setting that binds: the ad mounts many viewports ahead,
   * so the margin — not the list — decides when the auction starts.
   */
  prefetchMargin?: number;
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
