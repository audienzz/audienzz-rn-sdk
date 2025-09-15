import NativeModulesCombined from './NativeRNAudienzzModule';
import type { IRNAudienzzModule } from './types';

class RNAudienzzClass implements IRNAudienzzModule {
  initialize(companyID: string) {
    return NativeModulesCombined.AudienzzModule.initialize(companyID);
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
