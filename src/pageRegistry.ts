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

let currentPage: string | null = null;
let epoch = 0;

type PageListener = (page: string, epoch: number) => void;

const listeners = new Set<PageListener>();

/** The page reported by the most recent `Audienzz.pageImpression`. */
export function getCurrentPage(): string | null {
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
 * Record a page transition and notify mounted banners. Called by
 * `Audienzz.pageImpression` after the native call, so native has already swept
 * by the time listeners run.
 */
export function notifyPageImpression(page: string): void {
  currentPage = page;
  epoch += 1;
  listeners.forEach((listener) => listener(page, epoch));
}
