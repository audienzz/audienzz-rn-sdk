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

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  requireNativeComponent,
  UIManager,
  findNodeHandle,
} from 'react-native';
import type { OriginalInterstitialProps, AdError } from '../../types';
import { LINKING_ERROR } from '../../constants';

const ComponentName = 'RCTOriginalInterstitialView';
const NativeComponent = requireNativeComponent<any>(ComponentName);

export interface OriginalInterstitialHandle {
  /** Displays the loaded interstitial ad. Call this after `onAdLoaded` fires. */
  show(): void;
}

export const OriginalInterstitial = forwardRef<
  OriginalInterstitialHandle,
  OriginalInterstitialProps
>((props, ref) => {
  const {
    adUnitId,
    auConfigId,
    gpId,
    minSizePercentage = [80, 60],
    playbackMethod = ['AutoPlaySoundOn'],
    isLazyLoad = true,
    adFormats = ['banner', 'video'],
    apiParameters = ['MRAID_1', 'MRAID_2', 'MRAID_3', 'OMID_1'],
    videoProtocols = ['VAST_2_0'],
    videoBitrate = [300, 1500],
    videoDuration = [5, 30],
    onAdFailedToLoad,
    ...restProps
  } = props;

  const nativeRef = useRef<any>(null);

  if (UIManager.getViewManagerConfig(ComponentName) == null) {
    throw new Error(LINKING_ERROR);
  }

  useImperativeHandle(ref, () => ({
    show() {
      const node = findNodeHandle(nativeRef.current);
      if (node != null) {
        UIManager.dispatchViewManagerCommand(
          node,
          UIManager.getViewManagerConfig(ComponentName).Commands.show,
          []
        );
      }
    },
  }));

  const handleAdFailedToLoad = (
    event: AdError | { nativeEvent: { code: number; message: string } }
  ) => {
    const error: AdError = 'nativeEvent' in event ? event.nativeEvent : event;
    onAdFailedToLoad?.(error);
  };

  return (
    <NativeComponent
      ref={nativeRef}
      {...restProps}
      adUnitID={adUnitId}
      auConfigID={auConfigId}
      gpID={gpId}
      playbackMethod={playbackMethod}
      isLazyLoad={isLazyLoad}
      adFormats={adFormats}
      apiParameters={apiParameters}
      videoProtocols={videoProtocols}
      videoBitrate={videoBitrate}
      videoDuration={videoDuration}
      minSizesPercentage={minSizePercentage}
      onAdFailedToLoad={handleAdFailedToLoad}
    />
  );
});
