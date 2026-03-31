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
  /** Pause auto-refresh when the ad is off-screen, resume on return.
   *  On return, fires immediately if the creative is stale (off-screen
   *  longer than the refresh interval), otherwise fires after the remaining time. */
  smartRefresh?: boolean;
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
