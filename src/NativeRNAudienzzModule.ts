import { NativeModules } from 'react-native';
import type { RNAudienzzModule, RNAudienzzTargetingModule } from './types';

const { RNAudienzzModule: NativeRNAudienzzModule, RNAudienzzTargetingModule: NativeRNAudienzzTargetingModule } = NativeModules;

const NativeModulesCombined = {
  AudienzzModule: NativeRNAudienzzModule as RNAudienzzModule,
  AudienzzTargetingModule: NativeRNAudienzzTargetingModule as RNAudienzzTargetingModule,
};

export default NativeModulesCombined;
