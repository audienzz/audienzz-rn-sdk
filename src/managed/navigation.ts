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

import {
  activateManagedPage,
  claimedManagedPage,
  createPageInstance,
} from '../pageRegistry';
import { Audienzz } from '../RNAudienzz';

/**
 * The shape this adapter needs from a React Navigation state. Declared structurally so the SDK does
 * not take a dependency on @react-navigation.
 */
export interface AudienzzNavigationState {
  index?: number;
  routes?: ReadonlyArray<{
    key: string;
    name: string;
    state?: AudienzzNavigationState;
  }>;
}

let lastReportedRouteKey: string | null = null;

/** The deepest focused route, so a screen inside a nested navigator is reported, not its container. */
function focusedRoute(
  state: AudienzzNavigationState | undefined
): { key: string; name: string } | null {
  if (state?.routes == null || state.routes.length === 0) {
    return null;
  }
  const route = state.routes[state.index ?? state.routes.length - 1];
  if (route == null) {
    return null;
  }
  return focusedRoute(route.state) ?? { key: route.key, name: route.name };
}

/**
 * React Navigation adapter. Wire it once:
 *
 * ```tsx
 * <NavigationContainer onStateChange={audienzzOnNavigationStateChange}>
 * ```
 *
 * `route.key` is React Navigation's own per-instance identity, so two article screens are two
 * pages even though they share the name "article" — which is exactly the distinction the page
 * coordinator needs and a screen name cannot provide.
 *
 * Every focus change is reported, including moves to screens that carry no ads: that is what
 * releases the previous page's banners. Deactivation does not need a fabricated ad event.
 */
export function audienzzOnNavigationStateChange(
  state: AudienzzNavigationState | undefined
): void {
  const route = focusedRoute(state);
  if (route == null) {
    return;
  }
  // Deduplicate this ADAPTER's own callbacks — onStateChange fires for things that are not
  // navigation (params updates, nested state churn). An explicit Audienzz.pageImpression() from app
  // code is untouched by this: suppressing all repeated reports would break a deliberate one.
  if (route.key === lastReportedRouteKey) {
    return;
  }
  lastReportedRouteKey = route.key;
  // A wrapper on this screen is the authority on which page instance this is; both of us reporting
  // the same navigation cost two replacement auctions. Identity is per route instance either way —
  // React Navigation's route.key is exactly that.
  const page =
    claimedManagedPage(route.name) ?? createPageInstance(route.key, route.name);
  activateManagedPage(page, (p) => Audienzz.activatePage(p));
}

/** Test/host-restart hook: forget what this adapter last reported. */
export function resetAudienzzNavigationTracking(): void {
  lastReportedRouteKey = null;
}
