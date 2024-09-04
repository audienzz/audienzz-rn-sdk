/*
    Copyright 2024 Audienzz AG

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

*/

import React from 'react';
import { requireNativeComponent, UIManager } from 'react-native';
import type { IOriginalInterstitialProps, TAdError } from '../../types';
import { LINKING_ERROR } from '../../constants';

const ComponentName = 'RCTOriginalInterstitialView';
const NativeComponent =
  requireNativeComponent<IOriginalInterstitialProps>(ComponentName);

export const OriginalInterstitial = (props: IOriginalInterstitialProps) => {
  const {
    playbackMethod = ['AutoPlaySoundOn'],
    isLazyLoad = true,
    adFormats = ['banner', 'video'],
    apiParameters = ['MRAID_2'],
    videoProtocols = ['VAST_2_0'],
    videoBitrate = [300, 1500],
    videoDuration = [5, 30],
    minSizesPercentage = [80, 60],
    onAdFailedToLoad,
    ...restProps
  } = props;

  if (UIManager.getViewManagerConfig(ComponentName) == null) {
    throw new Error(LINKING_ERROR);
  }

  const handleAdFailedToLoad = (
    event: TAdError | { nativeEvent: { code: number; message: string } }
  ) => {
    const error: TAdError = 'nativeEvent' in event ? event.nativeEvent : event;
    onAdFailedToLoad?.(error);
  };

  return (
    <NativeComponent
      {...restProps}
      playbackMethod={playbackMethod}
      isLazyLoad={isLazyLoad}
      adFormats={adFormats}
      apiParameters={apiParameters}
      videoProtocols={videoProtocols}
      videoBitrate={videoBitrate}
      videoDuration={videoDuration}
      minSizesPercentage={minSizesPercentage}
      onAdFailedToLoad={handleAdFailedToLoad}
    />
  );
};