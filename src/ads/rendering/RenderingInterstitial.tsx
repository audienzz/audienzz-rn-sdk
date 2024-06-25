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
import type { IRenderingInterstitialProps, TAdError } from '../../types';
import { LINKING_ERROR } from '../../constants';

const ComponentName = 'RCTRenderingInterstitialView';
const NativeComponent =
  requireNativeComponent<IRenderingInterstitialProps>(ComponentName);

export const RenderingInterstitial = (props: IRenderingInterstitialProps) => {
  const {
    isLazyLoad = true,
    onAdFailedToLoad,
    minSizesPercentage = [80, 60],
    skipDelay = 15,
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
      isLazyLoad={isLazyLoad}
      minSizesPercentage={minSizesPercentage}
      skipDelay={skipDelay}
      onAdFailedToLoad={handleAdFailedToLoad}
    />
  );
};
