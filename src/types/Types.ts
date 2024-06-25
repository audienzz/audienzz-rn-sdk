export type TAdError = {
  code: number;
  message: string;
};

export type TAdFormat = 'banner' | 'video';

export type TAdFormats = Array<'banner' | 'video'>;

export type TApiParameters = Array<
  'MRAID_1' | 'MRAID_2' | 'MRAID_3' | 'VPAID_1' | 'VPAID_2' | 'OMID_1' | 'ORMMA'
>;

export type TMinSizesPercentage = [number, number];

export type TPlaybackMethod = Array<
  | 'AutoPlaySoundOn'
  | 'AutoPlaySoundOff'
  | 'ClickToPlay'
  | 'MouseOver'
  | 'EnterSoundOn'
  | 'EnterSoundOff'
>;

export type TRewardEarnedEvent = {
  type: string;
  amount: number;
};

export type TVideoBitrate = [number, number];

export type TVideoDuration = [number, number];

export type TVideoPlacement =
  | 'inBanner'
  | 'inArticle'
  | 'inFeed'
  | 'interstitial';

export type TVideoProtocols = Array<
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
