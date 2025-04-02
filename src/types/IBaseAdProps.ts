import type { ViewStyle } from 'react-native';
import type { IAppContent } from './IAppContent';

export interface IBaseAdProps {
  adUnitID: string;
  auConfigID: string;
  isLazyLoad?: boolean;
  isAdaptive?: boolean;
  pbAdSlot?: string;
  gpID?: string;
  keyword?: string;
  keywords?: string[];
  appContent?: IAppContent;
  style?: ViewStyle;
}
