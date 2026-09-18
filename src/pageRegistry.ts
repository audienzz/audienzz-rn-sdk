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

/**
 * A page instance.
 *
 * `id` is identity and `name` is what analytics records, and they are different things: a name
 * repeats — two article routes are both "article" — while ownership must not. When the name is used
 * as identity, the second article's page impression matches the first article's banners and
 * recreates them instead of releasing them, so they keep auctioning for a screen the reader left.
 */
export interface AudienzzPageHandle {
  readonly id: string;
  readonly name: string;
}

/**
 * A page whose identity is its name.
 *
 * This is the long-standing contract and the default everywhere: the navigation adapter, the
 * `AudienzzPage` wrapper and `Audienzz.pageImpression(name)` all produce the same id for the same
 * name, so reporting a screen again matches the banners already on it and refreshes them.
 *
 * An earlier revision minted a fresh id per call. That silently broke the contract — a second
 * report of the same name released the banners instead of refreshing them, and they could never
 * match again — and it made the adapter and the wrapper disagree about who owned a page.
 */
export function createPage(name: string): AudienzzPageHandle {
  return { id: name, name };
}

/**
 * A page identified by route instance rather than by name, so two routes that share a screen name
 * own their banners separately.
 *
 * Opt-in, and it must be opted into on **both** sides: pass `perInstance` to the navigation adapter
 * and the matching `id` to `AudienzzPage`, or the two will disagree about which page a banner is
 * on. With React Navigation, `route.key` is the instance key to use for both.
 */
export function createPageInstance(
  instanceId: string,
  name: string
): AudienzzPageHandle {
  return { id: instanceId, name };
}

let currentPage: AudienzzPageHandle | null = null;
let epoch = 0;

type PageListener = (page: string, epoch: number) => void;

const listeners = new Set<PageListener>();

/** The page reported by the most recent `Audienzz.pageImpression`. */
export function getCurrentPage(): AudienzzPageHandle | null {
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
  epoch += 1;
  listeners.forEach((listener) => listener(page, epoch));
}

/**
 * Records the page new ads are stamped with. Called synchronously by
 * `Audienzz.pageImpression`, because the documented ordering is "report the
 * page, then render its ads" — waiting for native's asynchronous echo would
 * stamp those ads with the previous page (or null), permanently.
 *
 * Kept separate from [notifyPageImpression]: the stamp is JS-owned and
 * immediate; the epoch and listener notifications stay native-owned.
 */
export function setCurrentPage(page: AudienzzPageHandle): void {
  currentPage = page;
}

/**
 * The routing key a banner sends to native as `pageKey`, and that native echoes back on a page
 * impression. It is the page id, not the display name — matching on the name cannot separate two
 * routes that share one.
 */
export function pageKeyOf(page: AudienzzPageHandle | null): string | null {
  return page == null ? null : page.id;
}

DeviceEventEmitter.addListener(PAGE_IMPRESSION_EVENT, (page: string) => {
  if (typeof page === 'string' && page.length > 0) {
    notifyPageImpression(page);
  }
});
