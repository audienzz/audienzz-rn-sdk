import type { IAdEvents } from './IAdEvents';
import type { IBaseAdProps } from './IBaseAdProps';
import type { IParamaters } from './IParameters';
import type { TAdFormat, TMinSizesPercentage } from './Types';

export interface IRenderingBannerProps
  extends IBaseAdProps,
    Omit<IParamaters, 'adFormats'>,
    Omit<IAdEvents, 'onRewardEarned'> {
  width: number;
  height: number;
  adFormat: TAdFormat;
  isReserved?: boolean;
}

export interface IRenderingInterstitialProps
  extends IBaseAdProps,
    Omit<IAdEvents, 'onRewardEarned'> {
  adFormat: TAdFormat;
  minSizesPercentage?: TMinSizesPercentage;
  skipDelay?: number;
}

export interface IRenderingRewardedProps
  extends IBaseAdProps,
    Omit<IAdEvents, 'onRewardEarned'> {
  onRewardEarned(): void;
  minSizesPercentage?: TMinSizesPercentage;
}
