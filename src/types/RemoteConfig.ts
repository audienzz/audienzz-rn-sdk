import type { AdEvents } from './AdEvents';
import type { StyleProp, ViewStyle } from 'react-native';

export interface RemoteConfigBannerProps extends AdEvents {
    adConfigId: string;
    style?: StyleProp<ViewStyle>;
}

export interface RemoteConfigInterstitialProps extends AdEvents {
    adConfigId: string;
}
