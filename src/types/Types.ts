export type AdError = {
  code: number;
  message: string;
};

export type AdSize = {
  width: number;
  height: number;
}

export type AdFormat = 'banner' | 'video';

export type AdFormats = Array<'banner' | 'video'>;

export type ApiParameters = Array<
  'MRAID_1' | 'MRAID_2' | 'MRAID_3' | 'VPAID_1' | 'VPAID_2' | 'OMID_1' | 'ORMMA'
>;

export type MinSizePercentage = [number, number];
/** @deprecated Use `MinSizePercentage` instead. */
export type MinSizesPercentage = MinSizePercentage;

export type PlaybackMethod = Array<
  | 'AutoPlaySoundOn'
  | 'AutoPlaySoundOff'
  | 'ClickToPlay'
  | 'MouseOver'
  | 'EnterSoundOn'
  | 'EnterSoundOff'
>;

export type RewardEarnedEvent = {
  type: string;
  amount: number;
};

export type VideoBitrate = [number, number];

export type VideoDuration = [number, number];

export type VideoPlacement =
  | 'inBanner'
  | 'inArticle'
  | 'inFeed'
  | 'interstitial';

export type VideoProtocols = Array<
  | 'VAST_1_0'
  | 'VAST_2_0'
  | 'VAST_3_0'
  | 'VAST_4_0'
  | 'DAAST_1_0'
  | 'VAST_1_0_Wrapped'
  | 'VAST_2_0_Wrapped'
  | 'VAST_3_0_Wrapped'
  | 'VAST_4_0_Wrapped'
  | 'DAAST_1_0_Wrapped'
>;
