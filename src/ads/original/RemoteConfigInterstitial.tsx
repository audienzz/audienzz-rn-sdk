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

/**
 * Three verbs, and the verb decides whether anything is presented.
 *
 * | Before | Now |
 * | --- | --- |
 * | `preload()` | `prefetch()` |
 * | `showAtOpportunity(eligible)` | `show(eligible)` |
 * | `show()` | `show()` — same call, still "this is an opportunity" |
 * | `manualControl={false}` (loads and presents on mount) | unchanged, and it is `prefetchAndShow()` |
 */
export interface RemoteConfigInterstitialHandle {
  /** Obtain and retain one ad without displaying it. Never presents. */
  prefetch(): void;
  /**
   * Present as soon as the load completes, or present inventory already in hand. The only call
   * that presents something you did not explicitly time.
   */
  prefetchAndShow(): void;
  /**
   * Present ready inventory at this opportunity. Pass your current frequency-cap decision as
   * [eligible] (default `true`). If nothing is ready or the opportunity is ruled out, that is
   * reported through `onLifecycleEvent` as `opportunitySkipped` and NOTHING is scheduled — the
   * reader will not be interrupted later, somewhere else.
   */
  show(eligible?: boolean): void;
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
        prefetch: () => dispatch('prefetch'),
        prefetchAndShow: () => dispatch('prefetchAndShow'),
        show: (eligible = true) => dispatch('show', [eligible]),
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
