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
import type { RemoteConfigInterstitialProps } from '../../types';
import { LINKING_ERROR } from '../../constants';

const ComponentName = 'RNRemoteConfigInterstitial';
const NativeComponent = requireNativeComponent<any>(ComponentName);

export interface RemoteConfigInterstitialHandle {
  /** Displays the loaded interstitial ad. Call this after `onAdLoaded` fires. */
  show(): void;
}

export const RemoteConfigInterstitial = forwardRef<
  RemoteConfigInterstitialHandle,
  RemoteConfigInterstitialProps
>((props, ref) => {
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
          UIManager.getViewManagerConfig(ComponentName).Commands.show ?? 'show',
          []
        );
      }
    },
  }));

  return <NativeComponent ref={nativeRef} {...props} />;
});
