import type { AdEvents } from './AdEvents';
import type { BaseAdProps } from './BaseAdProps';
import type { Parameters } from './Parameters';
import type { AdSize, MinSizesPercentage, RewardEarnedEvent } from './Types';

export interface OriginalBannerProps
  extends BaseAdProps,
  Parameters,
  AdEvents {
  sizes: AdSize[];
  isReserved?: boolean;
  autoRefreshPeriodMillis?: number;
}

export interface OriginalInterstitialProps
  extends Omit<BaseAdProps, 'style'>,
  Omit<Parameters, 'videoPlacement'>,
  AdEvents {
  sizes?: AdSize[];
  minSizesPercentage?: MinSizesPercentage;
}

export interface OriginalRewardedProps
  extends Omit<BaseAdProps, 'style'>,
  Pick<
    Parameters,
    Exclude<keyof Parameters, 'adFormats' | 'videoPlacement'>
  >,
  Omit<AdEvents, 'onAdClosed'> {
  onAdClosed?(reward: RewardEarnedEvent): void;
}
