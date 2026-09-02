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

// Registry of mounted smart-refresh banner reload callbacks. Each banner
// component registers its reload on mount and removes it on unmount;
// `Audienzz.onScreenResumed` broadcasts to all of them so a returning
// route/tab reloads its on-screen banners (parity with the native SDK).
// The native reload command self-filters by visibility, so off-screen
// (kept-mounted) banners are not re-auctioned.

const reloaders = new Set<() => void>();

export function addBannerReloader(reload: () => void): void {
  reloaders.add(reload);
}

export function removeBannerReloader(reload: () => void): void {
  reloaders.delete(reload);
}

export function notifyScreenResumedReload(): void {
  reloaders.forEach((reload) => reload());
}
