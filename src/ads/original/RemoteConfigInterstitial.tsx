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

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
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
  /**
   * Whether an ad is held and ready for [show] — the counterpart of native `isReady`.
   *
   * Synchronous, like native: it mirrors the readiness native reports on every lifecycle event,
   * plus native's one-hour inventory lifetime. Advisory only — [show] is still the authority, and
   * reports `opportunitySkipped` if the inventory went away in between.
   */
  isReady(): boolean;
  /** Release this owner permanently. Remount to use a new owner. */
  dispose(): void;
}

/** Native discards held inventory after an hour (iOS `3600` s, Android `3_600_000` ms). */
const INVENTORY_LIFETIME_MS = 3_600_000;

export const RemoteConfigInterstitial = forwardRef<
  RemoteConfigInterstitialHandle,
  RemoteConfigInterstitialProps
>((props, ref) => {
  const nativeRef = useRef<any>(null);
  // Mirrors native readiness. Not re-derived from event names: several native paths treat held
  // inventory differently on the same event, so JS would drift from them. `since` is when it last
  // became ready, for the lifetime check — native evaluates expiry lazily and emits nothing then.
  const readiness = useRef({ ready: false, since: 0 });
  const config = UIManager.getViewManagerConfig(ComponentName);

  // A new config means a new native owner holding nothing. Native's replacement teardown is not
  // guaranteed to reach JS on every platform, so this does not wait for it.
  useEffect(() => {
    readiness.current = { ready: false, since: 0 };
  }, [props.adConfigId]);
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
        isReady: () =>
          readiness.current.ready &&
          Date.now() - readiness.current.since < INVENTORY_LIFETIME_MS,
        dispose: () => {
          readiness.current = { ready: false, since: 0 };
          dispatch('dispose');
        },
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
      // Always attached, not only when the publisher subscribes: it is what feeds isReady().
      onLifecycleEvent={(e: any) => {
        const event = e.nativeEvent;
        if (typeof event?.ready === 'boolean') {
          const wasReady = readiness.current.ready;
          readiness.current = {
            ready: event.ready,
            since: event.ready && !wasReady ? Date.now() : readiness.current.since,
          };
        }
        props.onLifecycleEvent?.(event);
      }}
    />
  );
});
