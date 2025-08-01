import { NativeModules } from 'react-native';
import type { IRNAudienzzModule, IRNAudienzzTargetingModule } from './types';

const { RNAudienzzModule, RNAudienzzTargetingModule } = NativeModules;

// You could also create a single object to export them all
const NativeModulesCombined = {
  AudienzzModule: RNAudienzzModule as IRNAudienzzModule,
  AudienzzTargetingModule: RNAudienzzTargetingModule as IRNAudienzzTargetingModule,
};

export default NativeModulesCombined;

