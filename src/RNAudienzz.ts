import NativeModulesCombined from './NativeRNAudienzzModule';
import type { RNAudienzzModule, AudienzzInitStatus } from './types';
import { setCurrentPage } from './pageRegistry';

class RNAudienzzClass implements RNAudienzzModule {
  initialize(companyId: string) {
    return NativeModulesCombined.AudienzzModule.initialize(companyId);
  }

  /**
   * Supply your own PPID (e.g. a hashed e-mail address). It takes precedence
   * over the SDK-generated one; pass `null` to clear and fall back to it.
   */
  setPublisherPpid(ppid: string | null): void {
    // Deliberately not a Promise: both native implementations are plain void methods with no
    // promise callbacks, so a declared Promise<void> was a lie that made valid TypeScript --
    // `setPublisherPpid(id).then(...)` -- throw at runtime. Setting a PPID is a local assignment;
    // there is nothing to await.
    NativeModulesCombined.AudienzzModule.setPublisherPpid(ppid);
  }

  /**
   * The PPID currently being sent: yours if set via `setPublisherPpid`,
   * otherwise the SDK-generated UUID. `null` only when consent is missing.
   *
   * A PPID is always sent with ad requests — the SDK generates one (persisted
   * locally, rotated every 12 months) whenever you haven't supplied your own.
   * There is no enable/disable switch.
   */
  getPpid(): Promise<string | null> {
    return NativeModulesCombined.AudienzzModule.getPpid();
  }

  setSchainObject(schain: string): Promise<void> {
    return NativeModulesCombined.AudienzzModule.setSchainObject(schain);
  }

  /**
   * Set the global GMA ad audio volume for all ad types (banner, interstitial,
   * rewarded). `volume` is clamped to [0.0, 1.0]: 0.0 = muted, 1.0 = full device
   * volume. The SDK defaults to 0.0 (muted) on init.
   */
  setAppVolume(volume: number): void {
    NativeModulesCombined.AudienzzModule.setAppVolume(volume);
  }

  /**
   * Force smart-refresh v2 on/off, overriding the backend `smartRefreshV2`
   * config for the rest of the session. v2 uses the directional viewport gate
   * (top fully on screen, at most half off the bottom); v1 uses the legacy
   * ≥20%-visible gate. Call before creating banners. Omit to defer to backend.
   */
  setSmartRefreshV2Enabled(enabled: boolean): void {
    NativeModulesCombined.AudienzzModule.setSmartRefreshV2Enabled(enabled);
  }

  /**
   * When true, a banner blanks its slot for the duration of a screen-resume
   * reload (matching the native blankOnScreenReload). Default false — the old
   * creative stays visible until the new one arrives. Call before creating banners.
   */
  setBlankOnScreenReload(enabled: boolean): void {
    NativeModulesCombined.AudienzzModule.setBlankOnScreenReload(enabled);
  }

  /**
   * Report an ad-bearing screen, dialog, or popup by name. Call it on every such screen (React
   * Native has a single host, so there's nothing to auto-derive — pass a stable name, e.g. your
   * navigation route name). Fires a `pageImpression` + a fresh page-impression id, and reloads the
   * on-screen smart-refresh banners so a returning route/tab shows a fresh creative.
   */
  pageImpression(name: string): void {
    // Native owns the transition end-to-end for original-API banners: every
    // banner not on the incoming page is released (auction and refresh stopped)
    // and the incoming page's are re-auctioned in place. An RN banner is a real
    // native ad view, so that repaints on its own -- the bridge must NOT also
    // remount it, or the replacement's initial load would fire a second
    // auction and discard the creative native just fetched.
    // Stamp synchronously so ads rendered right after this call belong to this
    // page; the epoch and listener notifications arrive with native's echo.
    setCurrentPage(name);
    NativeModulesCombined.AudienzzModule.pageImpression(name);
    // No JS-side notify here: native echoes every page impression back as the
    // `AudienzzPageImpression` device event (see pageRegistry), including the
    // automatic one on returning to the foreground, which never passes through
    // this method. One owner, so a transition can't be counted twice.
  }

  configureRemote(remoteUrl: string, publisherId: string): Promise<void> {
    return NativeModulesCombined.AudienzzModule.configureRemote(remoteUrl, publisherId);
  }

  fetchPublisherConfig(publisherId: string): Promise<void> {
    return NativeModulesCombined.AudienzzModule.fetchPublisherConfig(publisherId);
  }

  initializeRemote(remoteUrl: string, publisherId: string): Promise<AudienzzInitStatus> {
    return this.configureRemote(remoteUrl, publisherId)
      .then(() => {
        return this.fetchPublisherConfig(publisherId);
      })
      .then(() => ({
        status: 'SUCCEEDED',
        description: `Remote SDK initialized successfully`,
      }));
  }

  getStickyConfig(adConfigId: string): Promise<{ maxHeight: number; stickyTopOffset: number }> {
    return NativeModulesCombined.AudienzzModule.getStickyConfig(adConfigId);
  }
}


const Instance = new RNAudienzzClass();

/**
 * Singleton SDK entry point.
 *
 * @example
 * import { Audienzz } from 'audienzz';
 * Audienzz.initialize('companyId', false);
 */
export const Audienzz: RNAudienzzModule = Instance;

/**
 * @deprecated Use `Audienzz` instead.
 * `RNAudienzz()` will be removed in a future release.
 *
 * @example
 * // Before (deprecated)
 * RNAudienzz().initialize('companyId', false);
 * // After
 * Audienzz.initialize('companyId', false);
 */
export const RNAudienzz = () => Instance;

export default RNAudienzz;
