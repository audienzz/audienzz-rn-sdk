import type { ViewStyle } from 'react-native';

export interface BaseAdProps {
  adUnitId: string;
  auConfigId: string;
  isLazyLoad?: boolean;
  isAdaptive?: boolean;
  pbAdSlot?: string;
  gpId?: string;
  impOrtbConfig?: string;
  style?: ViewStyle;
}
