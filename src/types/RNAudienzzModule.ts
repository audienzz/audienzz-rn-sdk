export type AudienzzInitStatus = {
  status: string;
  description: string;
};

export interface RNAudienzzModule {
  initialize(companyId: string, enablePpid: boolean): Promise<AudienzzInitStatus>;

  isAutomaticPpidEnabled(): Promise<boolean>;
  setAutomaticPpidEnabled(enablePpid: boolean): Promise<void>;
  getPpid(): Promise<string | null>;

  setSchainObject(schain: string): Promise<void>;

  /**
   * Enable/disable native automatic screen tracking. It is ON in the native SDK, but a React Native
   * app has a single host screen, so auto-tracking collapses every JS route into one coarse page
   * impression. Call `setAutoScreenTracking(false)` before `initialize()`/`initializeRemote()` and
   * report screens explicitly with `onScreenResumed()` for per-route analytics.
   */
  setAutoScreenTracking(enabled: boolean): void;

  /**
   * Report the active screen by an opaque route key (your navigation route id/name). Fires a
   * `pageImpression` and starts a fresh page-impression id that ties all ad events on this screen
   * visit together. Call on each navigation to an ad-bearing screen.
   */
  onScreenResumed(routeKey: string): void;

  configureRemote(remoteUrl: string, publisherId: string): Promise<void>;
  fetchPublisherConfig(publisherId: string, enablePpid: boolean): Promise<void>;

  /**
   * Initialize SDK with remote configuration
   * This method combines initialize(), configureRemote(), and fetchPublisherConfig()
   * @param remoteUrl - The remote configuration API URL
   * @param publisherId - The publisher ID
   * @param enablePpid - Whether to enable automatic PPID (default: false)
   */
  initializeRemote(remoteUrl: string, publisherId: string, enablePpid?: boolean): Promise<AudienzzInitStatus>;

  /**
   * Returns the backend-configured sticky wrapper dimensions for a given ad config ID.
   * Values are resolved as: backend value → SDK default (maxHeight: 600, stickyTopOffset: 0).
   * Used internally by `AudienzzStickyAdWrapper` when `adConfigId` is provided.
   */
  getStickyConfig(adConfigId: string): Promise<{ maxHeight: number; stickyTopOffset: number }>;
}
