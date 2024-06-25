import React from 'react';
import { requireNativeComponent, UIManager } from 'react-native';
import type { IOriginalInStreamProps } from '../../types/IOriginal';
import { LINKING_ERROR } from '../../constants';

const ComponentName = 'RCTOriginalInStreamView';
const NativeComponent =
  requireNativeComponent<IOriginalInStreamProps>(ComponentName);

export const OriginalInStream = (props: IOriginalInStreamProps) => {
  const {
    playbackMethod = ['AutoPlaySoundOff'],
    apiParameters = ['MRAID_2'],
    videoProtocols = ['VAST_2_0'],
    videoBitrate = [300, 1500],
    videoDuration = [5, 30],
    sizesForRequest = '640x480',
    ...restProps
  } = props;
  if (UIManager.getViewManagerConfig(ComponentName) == null) {
    throw new Error(LINKING_ERROR);
  }

  return (
    <NativeComponent
      {...restProps}
      playbackMethod={playbackMethod}
      apiParameters={apiParameters}
      videoProtocols={videoProtocols}
      videoBitrate={videoBitrate}
      videoDuration={videoDuration}
      sizesForRequest={sizesForRequest}
    />
  );
};
