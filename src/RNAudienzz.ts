import NativeModulesCombined from './NativeRNAudienzzModule';
import type { IRNAudienzzModule } from './types';

class RNAudienzzClass implements IRNAudienzzModule {
  initialize(companyID: string, enablePpid: Boolean = false) {
    return NativeModulesCombined.AudienzzModule.initialize(companyID, enablePpid);
  }

  isAutomaticPpidEnabled(): Promise<Boolean> {
    return NativeModulesCombined.AudienzzModule.isAutomaticPpidEnabled();
  }

  setAutomaticPpidEnabled(enablePpid: Boolean): Promise<void> {
    return NativeModulesCombined.AudienzzModule.setAutomaticPpidEnabled(enablePpid);
  }

  getPpid(): Promise<string | null> {
    return NativeModulesCombined.AudienzzModule.getPpid();
  }

  setSchainObject(schain: string): Promise<void> {
    return NativeModulesCombined.AudienzzModule.setSchainObject(schain);
  }
}

const Instance = new RNAudienzzClass();

export const RNAudienzz = () => {
  return Instance;
};

export default RNAudienzz;
