import type { IAdEvents } from './IAdEvents';
import type { IBaseAdProps } from './IBaseAdProps';
import type { IParamaters } from './IParameters';
import type { TMinSizesPercentage, TRewardEarnedEvent } from './Types';

export interface IOriginalBannerProps
  extends IBaseAdProps,
    IParamaters,
    IAdEvents {
  width: number;
  height: number;
  isReserved?: boolean;
  autoRefreshPeriodMillis?: number;
}

export interface IOriginalInterstitialProps
  extends IBaseAdProps,
    Omit<IParamaters, 'videoPlacement'>,
    IAdEvents {
  minSizesPercentage?: TMinSizesPercentage;
}

export interface IOriginalRewardedProps
  extends IBaseAdProps,
    Pick<
      IParamaters,
      Exclude<keyof IParamaters, 'adFormats' | 'videoPlacement'>
    >,
    Omit<IAdEvents, 'onAdClosed'> {
  onAdClosed?(reward: TRewardEarnedEvent): void;
}
