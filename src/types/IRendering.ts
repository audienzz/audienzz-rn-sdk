import type { IAdEvents } from './IAdEvents';
import type { IBaseAdProps } from './IBaseAdProps';
import type { IParamaters } from './IParameters';
import type { TAdFormat, TMinSizesPercentage } from './Types';

export interface IRenderingBannerProps
  extends IBaseAdProps,
    Omit<IParamaters, 'adFormats'>,
    IAdEvents {
  width: number;
  height: number;
  adFormat: TAdFormat;
  isReserved?: boolean;
}

export interface IRenderingInterstitialProps extends IBaseAdProps, IAdEvents {
  adFormat: TAdFormat;
  minSizesPercentage?: TMinSizesPercentage;
  skipDelay?: number;
}

export interface IRenderingRewardedProps extends IBaseAdProps, IAdEvents {
  minSizesPercentage?: TMinSizesPercentage;
}
