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
  /** Legacy explicit show. In manual mode, equivalent to showAtOpportunity(true). */
  show(): void;
  /** In manualControl mode, retain one ad without displaying it. */
  preload(): void;
  /** Try this opportunity once. Check publisher frequency caps before passing true. */
  showAtOpportunity(eligible: boolean): void;
  /** Release this owner permanently. Remount to use a new owner. */
  dispose(): void;
}

export const RemoteConfigInterstitial = forwardRef<
  RemoteConfigInterstitialHandle,
  RemoteConfigInterstitialProps
>((props, ref) => {
  const nativeRef = useRef<any>(null);
  const config = UIManager.getViewManagerConfig(ComponentName);
  if (config == null) throw new Error(LINKING_ERROR);

  useImperativeHandle(
    ref,
    () => {
      const dispatch = (command: string, args: unknown[] = []) => {
        const node = findNodeHandle(nativeRef.current);
        if (node != null) {
          UIManager.dispatchViewManagerCommand(
            node,
            config.Commands?.[command] ?? command,
            args
          );
        }
      };
      return {
        show: () => dispatch('show'),
        preload: () => dispatch('preload'),
        showAtOpportunity: (eligible: boolean) =>
          dispatch('showAtOpportunity', [eligible]),
        dispose: () => dispatch('dispose'),
      };
    },
    [config]
  );

  return (
    <NativeComponent
      ref={nativeRef}
      {...props}
      onAdFailedToLoad={
        props.onAdFailedToLoad &&
        ((e: any) => props.onAdFailedToLoad?.(e.nativeEvent))
      }
      onAdFailedToShow={
        props.onAdFailedToShow &&
        ((e: any) => props.onAdFailedToShow?.(e.nativeEvent))
      }
      onLifecycleEvent={
        props.onLifecycleEvent &&
        ((e: any) => props.onLifecycleEvent?.(e.nativeEvent))
      }
    />
  );
});
