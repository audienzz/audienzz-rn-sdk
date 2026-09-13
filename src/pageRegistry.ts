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

import { DeviceEventEmitter } from 'react-native';

// Page-scoped ad ownership for the React Native bridge.
//
// The native SDKs match an ad to its screen by host identity (Activity /
// Fragment / UIViewController). Every React Native ad lives in the single host
// Activity / view controller, so that can never distinguish one route's ads
// from another's — the route key has to travel with the ad instead. Each banner
// captures the page that is current when it mounts and passes it to native as
// `pageKey`; the native page coordinator then matches by value.
//
// On a page impression the native side releases every banner that is not on the
// incoming page and recreates the ones that are. The recreate is a fresh
// auction into the same native view, which on Android does not necessarily
// repaint, so banners belonging to the incoming page also remount their native
// view here — see `subscribe`.

/** Device event native emits after every page impression. */
const PAGE_IMPRESSION_EVENT = 'AudienzzPageImpression';

let currentPage: string | null = null;
let epoch = 0;

type PageListener = (page: string, epoch: number) => void;

const listeners = new Set<PageListener>();

/** The page reported by the most recent `Audienzz.pageImpression`. */
export function getCurrentPage(): string | null {
  if (currentPage == null) {
    // Native attach-time adoption cannot repair a bridge ad: with no page key
    // its host resolves to the single host Activity / view controller, which
    // can never equal a route key. So the ordering contract has to be enforced
    // by the app, and staying silent would just leave a dead slot.
    console.warn(
      '[Audienzz] Ad created before any pageImpression() call. Page-scoped ' +
        'release and reload cannot work for it: call ' +
        'Audienzz.pageImpression() for this screen BEFORE rendering its ads.'
    );
  }
  return currentPage;
}

/** Page counter, bumped on every page impression. */
export function getPageEpoch(): number {
  return epoch;
}

export function subscribe(listener: PageListener): void {
  listeners.add(listener);
}

export function unsubscribe(listener: PageListener): void {
  listeners.delete(listener);
}

/**
 * Record a page transition and notify mounted banners.
 *
 * Driven by the native `AudienzzPageImpression` device event, not by the JS
 * API, so it fires for EVERY real page impression — including the automatic one
 * native emits on returning to the foreground, which never passes through
 * `Audienzz.pageImpression`. Rendering banners page-scope themselves off this;
 * without it they missed foreground recreation entirely. One owner also means a
 * transition can't be counted twice.
 */
function notifyPageImpression(page: string): void {
  currentPage = page;
  epoch += 1;
  listeners.forEach((listener) => listener(page, epoch));
}

DeviceEventEmitter.addListener(PAGE_IMPRESSION_EVENT, (page: string) => {
  if (typeof page === 'string' && page.length > 0) {
    notifyPageImpression(page);
  }
});
