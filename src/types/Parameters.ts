import type {
  AdFormats,
  ApiParameters,
  PlaybackMethod,
  VideoBitrate,
  VideoDuration,
  VideoPlacement,
  VideoProtocols,
} from './Types';

export interface Parameters {
  adFormats?: AdFormats;
  apiParameters?: ApiParameters;
  playbackMethod?: PlaybackMethod;
  videoBitrate?: VideoBitrate;
  videoDuration?: VideoDuration;
  videoProtocols?: VideoProtocols;
  videoPlacement?: VideoPlacement;
}
