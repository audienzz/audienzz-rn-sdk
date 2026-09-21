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
import { logDiagnostic } from '../diagnostics';
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
 * Publisher controls for a managed banner, reached through a ref.
 *
 * Both are durable and independent of geometry: a scroll, a page impression or a return to the
 * foreground undoes neither.
 */
export interface AudienzzBannerHandle {
  /**
   * Report a cover the SDK cannot infer — a pointer-transparent veil, a painted overlay. Current
   * state, not an event: pass `false` when the cover goes away. Arbitrary overlays are **not**
   * claimed to be detectable without this.
   */
  reportCover(covered: boolean): void;
  /** Durable publisher pause. Only `resumeAutoRefresh` clears it. */
  stopAutoRefresh(): void;
  /** Clears the pause set by `stopAutoRefresh`. */
  resumeAutoRefresh(): void;
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
export const AudienzzBanner = React.forwardRef<
  AudienzzBannerHandle,
  AudienzzBannerProps
>(function AudienzzBanner({
  adConfigId,
  slotKey,
  placeholderHeight = 250,
  lazyLoad = true,
  prefetchMargin,
  style,
  onAdLoaded,
  onAdFailedToLoad,
}, ref) {
  const context = useAudienzzPage();
  const bannerRef = React.useRef<RemoteConfigBanner | null>(null);

  // Requested publisher state, held by the SLOT rather than by whichever native child currently
  // occupies it. A retained page that is hidden and shown again unmounts and recreates that child,
  // so a stop forwarded only to the old one came back cleared although the publisher never resumed.
  const intent = React.useRef({ covered: false, stopped: false });

  const applyIntent = React.useCallback(() => {
    const banner = bannerRef.current;
    if (banner == null) {
      return;
    }
    if (intent.current.covered) {
      banner.setCovered(true);
    }
    if (intent.current.stopped) {
      banner.stopAutoRefresh();
    }
  }, []);

  React.useImperativeHandle(
    ref,
    () => ({
      reportCover: (covered: boolean) => {
        intent.current.covered = covered;
        bannerRef.current?.setCovered(covered);
      },
      stopAutoRefresh: () => {
        intent.current.stopped = true;
        bannerRef.current?.stopAutoRefresh();
      },
      resumeAutoRefresh: () => {
        intent.current.stopped = false;
        bannerRef.current?.resumeAutoRefresh();
      },
    }),
    []
  );

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
    logDiagnostic('slot', 'hold', {
      slot: slotKey,
      config: adConfigId,
      page: context?.page.id,
      reason: context == null ? 'noPage' : 'pageNotActive',
    });
    return <View style={reserved} />;
  }

  // The ownership question, answered where the native view is actually created: which page this
  // slot belongs to. A slot whose page is not the one the reader is on is the shape of every
  // "my banner never loads" report.
  logDiagnostic('slot', 'create', {
    slot: slotKey,
    config: adConfigId,
    page: context.page.id,
    lazy: lazyLoad,
  });

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
        ref={(instance) => {
          const isNew = instance != null && instance !== bannerRef.current;
          bannerRef.current = instance;
          // A newly created native child inherits the slot's standing intent.
          if (isNew) {
            applyIntent();
          }
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  slot: { width: '100%' },
  fill: { width: '100%', height: '100%' },
});
