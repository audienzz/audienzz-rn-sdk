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
   * Set the global GMA ad audio volume for all ad types. `volume` is clamped to [0.0, 1.0]
   * (0.0 = muted, 1.0 = full device volume). The SDK defaults to muted on init.
   */
  setAppVolume(volume: number): void;

  /**
   * Force smart-refresh v2 on/off, overriding the backend `smartRefreshV2` config for the session.
   * v2 uses the directional viewport gate; v1 uses the legacy ≥20%-visible gate. Omit to defer to backend.
   */
  setSmartRefreshV2Enabled(enabled: boolean): void;

  /**
   * When true, a banner blanks its slot during a screen-resume reload (native `blankOnScreenReload`).
   * Default false — the old creative stays until the new one arrives.
   */
  setBlankOnScreenReload(enabled: boolean): void;

  /**
   * Report an ad-bearing screen, dialog, or popup by name (your navigation route id/name). Fires a
   * `pageImpression` and starts a fresh page-impression id that ties all ad events on this screen
   * visit together. Call on each navigation to an ad-bearing screen.
   */
  pageImpression(name: string): void;

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
