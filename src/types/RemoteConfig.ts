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
  /**
   * The page this banner belongs to, when the caller knows it better than the SDK does.
   *
   * Omitted, the banner captures whichever page was current when it was constructed. That is wrong
   * for a banner added to a retained-but-unfocused screen: the current page is the foreground one,
   * so the banner would be created as if it lived there. `AudienzzBanner` always supplies this from
   * its own `AudienzzPage`.
   */
  pageKey?: string;
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
  /**
   * Native interstitial lifecycle, correlated by `loadId`.
   *
   * `event` is one of loadRequested, loaded, loadFailed, showAttempted, presented, showFailed,
   * impression, dismissed, opportunitySkipped, disposeDeferred, disposed, or
   * `discardedWithoutImpression`.
   *
   * `discardedWithoutImpression` fires at most once per load, when inventory that loaded
   * successfully is released before it records an impression. `reason` then distinguishes
   * `expired`, `disposed`, `replaced`, `presentationFailed` and `dismissedWithoutImpression`.
   * It never fires for a load that failed, or for inventory that was shown and counted.
   *
   * It is a diagnostic, not a billing record: it does not replace Ad Manager's responses-served or
   * AdX render-rate reporting, which are measured server-side across demand sources the SDK cannot
   * see. A process killed while inventory is held emits nothing, so these counts are a lower bound.
   */
  onLifecycleEvent?(event: {
    event: string;
    reason?: string | null;
    loadId?: string | null;
    configId?: string | null;
    timestampMillis?: number | null;
    loadAgeMillis?: number | null;
    responseId?: string | null;
    /**
     * Native's own readiness at the moment this event fired — the value behind
     * `RemoteConfigInterstitialHandle.isReady()`.
     */
    ready?: boolean;
  }): void;
}
