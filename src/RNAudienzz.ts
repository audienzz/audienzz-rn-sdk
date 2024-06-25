import RNAudienzzModule from './NativeRNAudienzzModule';
import type { IRNAudienzzModule } from './types';

class RNAudienzzClass implements IRNAudienzzModule {
  initialize() {
    return RNAudienzzModule.initialize();
  }
}

const Instance = new RNAudienzzClass();

export const RNAudienzz = () => {
  return Instance;
};

export default RNAudienzz;
