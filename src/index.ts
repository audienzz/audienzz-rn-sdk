import {
  OriginalBanner,
  OriginalInterstitial,
  OriginalRewarded,
  RemoteConfigBanner,
  RemoteConfigInterstitial,
} from './ads/original';
import type {
  OriginalInterstitialHandle,
  OriginalRewardedHandle,
  RemoteConfigInterstitialHandle,
} from './ads/original';
import {
  RenderingBanner,
  RenderingInterstitial,
  RenderingRewarded,
} from './ads/rendering';

import { DEFAULT_REFRESH_TIME_SECONDS, DEFAULT_PREFETCH_DISTANCE_DP } from './types';
import type {
  RNAudienzzModule,
  RNAudienzzTargetingModule,
  AdEvents,
  Parameters,
  RenderingBannerProps,
  RenderingInterstitialProps,
  RenderingRewardedProps,
  OriginalBannerProps,
  OriginalInterstitialProps,
  OriginalRewardedProps,
  RemoteConfigBannerProps,
  RemoteConfigInterstitialProps,
  AudienzzInitStatus,
  AdError,
  AdFormat,
  AdFormats,
  ApiParameters,
  MinSizePercentage,
  MinSizesPercentage,
  PlaybackMethod,
  RewardEarnedEvent,
  VideoBitrate,
  VideoDuration,
  VideoPlacement,
  VideoProtocols,
  BaseAdProps,
  RemoteAdConfiguration,
  RemotePublisherConfiguration,
  AdSize,
  AudienzzExternalUserId,
  AudienzzUniqueId,
  AudienzzLocation,
} from './types';

export {
  OriginalBanner,
  OriginalInterstitial,
  OriginalRewarded,
  RemoteConfigBanner,
  RemoteConfigInterstitial,
  RenderingBanner,
  RenderingInterstitial,
  RenderingRewarded,
};

export { DEFAULT_REFRESH_TIME_SECONDS, DEFAULT_PREFETCH_DISTANCE_DP };
export { default, Audienzz, RNAudienzz } from './RNAudienzz';
export { Targeting, RNTargeting } from './RNTargeting';
export { AdSizes } from './constants';
export { AudienzzStickyAdWrapper } from './components/AudienzzStickyAdWrapper';
export type { AudienzzStickyAdWrapperProps } from './components/AudienzzStickyAdWrapper';

export type {
  AdEvents,
  BaseAdProps,
  RNAudienzzModule,
  RNAudienzzTargetingModule,
  OriginalBannerProps,
  OriginalInterstitialProps,
  OriginalInterstitialHandle,
  OriginalRewardedProps,
  OriginalRewardedHandle,
  RemoteConfigBannerProps,
  RemoteConfigInterstitialProps,
  RemoteConfigInterstitialHandle,
  AudienzzInitStatus,
  Parameters,
  RenderingBannerProps,
  RenderingInterstitialProps,
  RenderingRewardedProps,
  AdError,
  AdFormat,
  AdFormats,
  ApiParameters,
  MinSizePercentage,
  MinSizesPercentage,
  PlaybackMethod,
  RewardEarnedEvent,
  VideoBitrate,
  VideoDuration,
  VideoPlacement,
  VideoProtocols,
  RemoteAdConfiguration,
  RemotePublisherConfiguration,
  AdSize,
  AudienzzExternalUserId,
  AudienzzUniqueId,
  AudienzzLocation,
};

// Managed integration: one page wrapper, one banner component.
export { AudienzzPage, useAudienzzPage } from './managed/AudienzzPage';
export type {
  AudienzzPageProps,
  AudienzzPageContextValue,
} from './managed/AudienzzPage';
export { AudienzzBanner } from './managed/AudienzzBanner';
export type {
  AudienzzBannerProps,
  AudienzzBannerHandle,
} from './managed/AudienzzBanner';
export { createPage } from './pageRegistry';
export type { AudienzzPageHandle } from './pageRegistry';
export {
  audienzzOnNavigationReady,
  audienzzOnNavigationStateChange,
  resetAudienzzNavigationTracking,
} from './managed/navigation';
export type { AudienzzNavigationState } from './managed/navigation';
