import { NativeModules } from 'react-native';
import type { IRNAudienzzModule } from './types';

const { RNAudienzzModule } = NativeModules;

export default RNAudienzzModule as IRNAudienzzModule;
