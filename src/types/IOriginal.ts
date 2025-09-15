import type { IAdEvents } from './IAdEvents';
import type { IBaseAdProps } from './IBaseAdProps';
import type { IParamaters } from './IParameters';
import type { TAdSize, TMinSizesPercentage, TRewardEarnedEvent } from './Types';

export interface IOriginalBannerProps
  extends IBaseAdProps,
    IParamaters,
    IAdEvents {
  sizes: TAdSize[];
  isReserved?: boolean;
  autoRefreshPeriodMillis?: number;
}

export interface IOriginalInterstitialProps
  extends Omit<IBaseAdProps, 'style'>,
    Omit<IParamaters, 'videoPlacement'>,
    IAdEvents {
  sizes?: TAdSize[];
  minSizesPercentage?: TMinSizesPercentage;
}

export interface IOriginalRewardedProps
  extends Omit<IBaseAdProps, 'style'>,
    Pick<
      IParamaters,
      Exclude<keyof IParamaters, 'adFormats' | 'videoPlacement'>
    >,
    Omit<IAdEvents, 'onAdClosed'> {
  onAdClosed?(reward: TRewardEarnedEvent): void;
}
