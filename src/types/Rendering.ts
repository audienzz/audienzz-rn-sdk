import type { AdEvents } from './AdEvents';
import type { BaseAdProps } from './BaseAdProps';
import type { Parameters } from './Parameters';
import type { AdFormat, MinSizePercentage, RewardEarnedEvent } from './Types';

export interface RenderingBannerProps
  extends BaseAdProps,
  Omit<Parameters, 'adFormats'>,
  AdEvents {
  width: number;
  height: number;
  adFormat: AdFormat;
  isReserved?: boolean;
}

export interface RenderingInterstitialProps
  extends Omit<BaseAdProps, 'style'>,
  AdEvents {
  adFormat: AdFormat;
  minSizePercentage?: MinSizePercentage;
  skipDelay?: number;
}

export interface RenderingRewardedProps
  extends Omit<BaseAdProps, 'style'>,
  AdEvents {
  minSizePercentage?: MinSizePercentage;
  onUserEarnedReward?(reward: RewardEarnedEvent): void;
}
