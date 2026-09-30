/*
    Copyright 2025 Audienzz AG

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
import type { OriginalInterstitialProps, AdError } from '../../types';
import { LINKING_ERROR } from '../../constants';

const ComponentName = 'RCTOriginalInterstitialView';
const NativeComponent = requireNativeComponent<any>(ComponentName);

// Presents itself as soon as it loads: there is no imperative `show()`. The ref handle this
// used to expose dispatched a command neither view manager implements, so it did nothing.
// `onAdLoaded` reports availability, `onAdOpened` reports presentation, and
// `onAdFailedToShow` reports a failed presentation.
export const OriginalInterstitial = (props: OriginalInterstitialProps) => {
  const {
    adUnitId,
    auConfigId,
    gpId,
    minSizePercentage = [80, 60],
    // Muted autoplay, as the native interstitial default.
    playbackMethod = ['AutoPlaySoundOff'],
    isLazyLoad = true,
    videoProtocols = ['VAST_2_0'],
    videoBitrate = [300, 1500],
    videoDuration = [5, 30],
    onAdFailedToLoad,
    onAdFailedToShow,
    ...restProps
  } = props;

  if (UIManager.getViewManagerConfig(ComponentName) == null) {
    throw new Error(LINKING_ERROR);
  }

  const handleAdFailedToLoad = (
    event: AdError | { nativeEvent: { code: number; message: string } }
  ) => {
    const error: AdError = 'nativeEvent' in event ? event.nativeEvent : event;
    onAdFailedToLoad?.(error);
  };

  const handleAdFailedToShow = (
    event: AdError | { nativeEvent: { code: number; message: string } }
  ) => {
    const error: AdError = 'nativeEvent' in event ? event.nativeEvent : event;
    onAdFailedToShow?.(error);
  };

  return (
    <NativeComponent
      {...restProps}
      adUnitID={adUnitId}
      auConfigID={auConfigId}
      gpID={gpId}
      playbackMethod={playbackMethod}
      isLazyLoad={isLazyLoad}
      videoProtocols={videoProtocols}
      videoBitrate={videoBitrate}
      videoDuration={videoDuration}
      minSizesPercentage={minSizePercentage}
      onAdFailedToLoad={handleAdFailedToLoad}
      onAdFailedToShow={handleAdFailedToShow}
    />
  );
};
