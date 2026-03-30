import type { AdEvents } from './AdEvents';
import type { BaseAdProps } from './BaseAdProps';
import type { Parameters } from './Parameters';
import type { AdSize, MinSizePercentage, RewardEarnedEvent } from './Types';

export interface OriginalBannerProps
  extends BaseAdProps,
  Parameters,
  AdEvents {
  sizes: AdSize[];
  isReserved?: boolean;
  refreshTimeMillis?: number;
}

export interface OriginalInterstitialProps
  extends Omit<BaseAdProps, 'style'>,
  Omit<Parameters, 'videoPlacement'>,
  AdEvents {
  sizes?: AdSize[];
  minSizePercentage?: MinSizePercentage;
}

export interface OriginalRewardedProps
  extends Omit<BaseAdProps, 'style'>,
  Pick<
    Parameters,
    Exclude<keyof Parameters, 'adFormats' | 'videoPlacement'>
  >,
  AdEvents {
  onUserEarnedReward?(reward: RewardEarnedEvent): void;
}
