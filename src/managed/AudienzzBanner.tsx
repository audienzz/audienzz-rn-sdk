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
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { RemoteConfigBanner } from '../ads/original/RemoteConfigBanner';
import type { AdSize } from '../types';
import { useAudienzzPage } from './AudienzzPage';

export interface AudienzzBannerProps {
  /** Remote configuration id for this placement. */
  adConfigId: string;
  /**
   * Stable identity for this slot within its page. Required, because an `adConfigId` is not unique:
   * the same placement legitimately appears twice on one page, and the pair
   * `(page instance, slotKey)` is what tells those two apart across rebuilds and list recycling.
   */
  slotKey: string;
  /**
   * Height reserved before the creative arrives, in dp. The reservation is the point: the slot must
   * be laid out and sized *before* the viewport check runs, or lazy loading can never trigger.
   * Defaults to 250 (the tallest common in-content format) — set it to the height you actually
   * expect to avoid a visible reflow.
   */
  placeholderHeight?: number;
  /**
   * Defer the auction until the slot approaches the viewport. Defaults to `true` here, unlike the
   * low-level component, because this component owns the sized placeholder that makes deferral
   * work. Pass `false` for a slot that is always on screen.
   */
  lazyLoad?: boolean;
  /** How far ahead of the viewport the auction starts, in dp/pt. */
  prefetchMargin?: number;
  style?: StyleProp<ViewStyle>;
  onAdLoaded?(size: AdSize): void;
  onAdFailedToLoad?(error: { message: string }): void;
}

/**
 * A RemoteBanner that owns its own lifetime.
 *
 * The publisher places it and does nothing else: no `load()`, no refresh timer, no reload after a
 * page impression or an app resume, no disposal. Creation waits for the page to be active, the
 * slot is sized before the first viewport check, an ordinary rebuild requests nothing, and leaving
 * the owning scope disposes.
 *
 * It must be rendered inside an `AudienzzPage`. That is not a convention — it is how the banner
 * learns which page instance owns it during its own render, rather than reading whichever page a
 * parent effect happened to report last.
 */
export function AudienzzBanner({
  adConfigId,
  slotKey,
  placeholderHeight = 250,
  lazyLoad = true,
  prefetchMargin,
  style,
  onAdLoaded,
  onAdFailedToLoad,
}: AudienzzBannerProps): React.ReactElement {
  const context = useAudienzzPage();

  if (context == null && __DEV__) {
    console.warn(
      `[Audienzz] <AudienzzBanner slotKey="${slotKey}"> is not inside an <AudienzzPage>. ` +
        'Without a page it cannot be released when the reader navigates away, and it will keep ' +
        'refreshing on a screen nobody is looking at. Wrap the screen in <AudienzzPage name="…">.'
    );
  }

  // The reservation is always rendered, active or not, so the surrounding layout does not jump when
  // the ad arrives — and so the slot has a real size the moment the page activates.
  const reserved = [styles.slot, { minHeight: placeholderHeight }, style];

  if (context == null || !context.isActive) {
    // Page not active yet: reserve the space, create nothing. A pre-mounted tab that the reader has
    // not opened must not buy an ad, and an ad created before its page is reported would be swept
    // as belonging to the previous page.
    return <View style={reserved} />;
  }

  return (
    <View style={reserved}>
      <RemoteConfigBanner
        // Identity, not decoration. Changing either half is a genuinely different slot and must
        // replace the owner; everything else — a parent re-render, a style change, a new callback
        // identity — reuses it and requests nothing.
        //
        // The page half is defence-in-depth: today a page change necessarily remounts this subtree,
        // so no reachable sequence hands the same mounted banner a different page, and a mutation
        // that drops it survives the suite. It is kept because a custom router that swaps the page
        // value in place would otherwise reuse the class instance, which captures its page at
        // construction and would silently keep the old one.
        key={`${context.page.id}:${slotKey}`}
        adConfigId={adConfigId}
        // Explicit, not inherited. A banner added to a retained-but-unfocused screen would
        // otherwise capture the foreground page and be created as if it lived there.
        pageKey={context.page.id}
        lazyLoad={lazyLoad}
        prefetchMargin={prefetchMargin}
        style={styles.fill}
        onAdLoaded={onAdLoaded}
        onAdFailedToLoad={onAdFailedToLoad}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { width: '100%' },
  fill: { width: '100%', height: '100%' },
});
