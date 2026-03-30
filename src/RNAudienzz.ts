import NativeModulesCombined from './NativeRNAudienzzModule';
import type { RNAudienzzModule, AudienzzInitStatus } from './types';

class RNAudienzzClass implements RNAudienzzModule {
  initialize(companyId: string, enablePpid: boolean = false) {
    return NativeModulesCombined.AudienzzModule.initialize(companyId, enablePpid);
  }

  isAutomaticPpidEnabled(): Promise<boolean> {
    return NativeModulesCombined.AudienzzModule.isAutomaticPpidEnabled();
  }

  setAutomaticPpidEnabled(enablePpid: boolean): Promise<void> {
    return NativeModulesCombined.AudienzzModule.setAutomaticPpidEnabled(enablePpid);
  }

  getPpid(): Promise<string | null> {
    return NativeModulesCombined.AudienzzModule.getPpid();
  }

  setSchainObject(schain: string): Promise<void> {
    return NativeModulesCombined.AudienzzModule.setSchainObject(schain);
  }

  configureRemote(remoteUrl: string, publisherId: string): Promise<void> {
    return NativeModulesCombined.AudienzzModule.configureRemote(remoteUrl, publisherId);
  }

  fetchPublisherConfig(publisherId: string, enablePpid: boolean = false): Promise<void> {
    return NativeModulesCombined.AudienzzModule.fetchPublisherConfig(publisherId, enablePpid);
  }

  initializeRemote(remoteUrl: string, publisherId: string, enablePpid: boolean = false): Promise<AudienzzInitStatus> {
    return this.configureRemote(remoteUrl, publisherId)
      .then(() => {
        return this.fetchPublisherConfig(publisherId, enablePpid);
      })
      .then(() => ({
        status: 'SUCCEEDED',
        description: `Remote SDK initialized successfully`,
      }));
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
