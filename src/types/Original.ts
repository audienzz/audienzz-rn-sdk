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
  /** Defer the ad request until the view scrolls into the viewport.
   *  Defaults to `true`. Set to `false` to load immediately on mount. */
  isLazyLoad?: boolean;
  /** Pause auto-refresh when the ad is off-screen, resume on return.
   *  On return, fires immediately if the creative is stale (off-screen
   *  longer than the refresh interval), otherwise fires after the remaining time. */
  smartRefresh?: boolean;
  /** Distance in logical pixels (pt on iOS, dp on Android) before the view
   *  enters the viewport that starts the Prebid demand fetch. Defaults to `200`.
   *  Only effective when `isLazyLoad` is `true`.
   *
   *  Has no practical effect inside a `FlatList` / `ScrollView`-recycled list —
   *  use `isLazyLoad={false}` there instead. */
  prefetchMargin?: number;
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
