import RNAudienzzModule from './NativeRNAudienzzModule';
import type { IRNAudienzzModule } from './types';

class RNAudienzzClass implements IRNAudienzzModule {
  initialize(companyID: string) {
    return RNAudienzzModule.initialize(companyID);
  }
}

const Instance = new RNAudienzzClass();

export const RNAudienzz = () => {
  return Instance;
};

export default RNAudienzz;
