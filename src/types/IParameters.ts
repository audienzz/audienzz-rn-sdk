import type {
  TAdFormats,
  TApiParameters,
  TPlaybackMethod,
  TVideoBitrate,
  TVideoDuration,
  TVideoPlacement,
  TVideoProtocols,
} from './Types';

export interface IParamaters {
  adFormats?: TAdFormats;
  apiParameters?: TApiParameters;
  playbackMethod?: TPlaybackMethod;
  videoBitrate?: TVideoBitrate;
  videoDuration?: TVideoDuration;
  videoProtocols?: TVideoProtocols;
  videoPlacement?: TVideoPlacement;
}
