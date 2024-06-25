import type { IAdEvents } from './IAdEvents';
import type { IBaseAdProps } from './IBaseAdProps';
import type { IParamaters } from './IParameters';
import type { TMinSizesPercentage } from './Types';

export interface IOriginalBannerProps
  extends IBaseAdProps,
    IParamaters,
    Omit<IAdEvents, 'onRewardEarned'> {
  width: number;
  height: number;
  isReserved?: boolean;
  autoRefreshPeriodMillis?: number;
}

export interface IOriginalInterstitialProps
  extends IBaseAdProps,
    Omit<IParamaters, 'videoPlacement'>,
    Omit<IAdEvents, 'onRewardEarned'> {
  minSizesPercentage?: TMinSizesPercentage;
}

export interface IOriginalRewardedProps
  extends IBaseAdProps,
    Pick<
      IParamaters,
      Exclude<keyof IParamaters, 'adFormats' | 'videoPlacement'>
    >,
    IAdEvents {}

export interface IOriginalInStreamProps extends IBaseAdProps, IParamaters {
  videoUrl: string;
  sizesForRequest?: '640x480' | '400x300';
}
