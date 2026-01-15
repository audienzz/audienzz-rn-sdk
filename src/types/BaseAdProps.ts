import type { ViewStyle } from 'react-native';

export interface BaseAdProps {
  adUnitID: string;
  auConfigID: string;
  isLazyLoad?: boolean;
  isAdaptive?: boolean;
  pbAdSlot?: string;
  gpID?: string;
  impOrtbConfig?: string;
  style?: ViewStyle;
}
