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
import {
  activateManagedPage,
  bindWrapperToRoute,
  createManagedPage,
  createPageInstance,
  forgetManagedActivation,
  releaseManagedPage,
  hasNavigationAdapterReported,
  isRouteFocused,
  subscribeRouteFocus,
  unbindWrapperFromRoute,
  type AudienzzPageHandle,
} from '../pageRegistry';
import { Audienzz } from '../RNAudienzz';

/**
 * What a managed banner needs to know about the page it is on.
 *
 * `isActive` is deliberately separate from mounting. A React Navigation screen can stay mounted
 * while another screen is on top, and a tab navigator pre-mounts screens the reader has not opened.
 * Mounting is not navigating.
 */
export interface AudienzzPageContextValue {
  readonly page: AudienzzPageHandle;
  readonly isActive: boolean;
}

const PageContext = React.createContext<AudienzzPageContextValue | null>(null);

/** The page a component is rendered inside, or `null` outside any `AudienzzPage`. */
export function useAudienzzPage(): AudienzzPageContextValue | null {
  return React.useContext(PageContext);
}

export interface AudienzzPageProps {
  /** Analytics screen name. Also the page identity unless [id] is given. */
  name: string;
  /**
   * Page identity, when a host wants to choose it — a custom router that already has a stable
   * per-instance key.
   *
   * Not needed for the default setup: a managed page is uniquely owned per route instance on its
   * own, and `audienzzOnNavigationStateChange` binds that same handle to the navigation route
   * rather than deriving one of its own. Name identity lives only where compatibility needs it —
   * the legacy `Audienzz.pageImpression(name)`.
   */
  id?: string;
  /**
   * The navigation route this screen is, so the SDK can bind this page to it.
   *
   * React Navigation hands every screen a `route` prop — pass it straight through. That is what
   * ties this wrapper to the route the adapter reports, so returning to a retained screen
   * reactivates the banners that are actually on it. Without it the binding would have to be
   * guessed from callback order, which is wrong whenever a screen's content mounts before or after
   * the navigation event — including at startup, where React Navigation emits no initial state
   * change at all.
   *
   * Omit it only when you are not using the navigation adapter.
   */
  route?: { key: string };
  /**
   * An extra condition on top of navigation focus. Defaults to `true`.
   *
   * When [route] is supplied and the navigation adapter is in use, focus is the adapter's to
   * decide — a screen is active when its route is the one being reported, so a retained screen
   * whose content mounts after the reader has moved on does NOT reactivate itself, and neither
   * does a pre-mounted tab. You do not need `useIsFocused()` for that.
   *
   * Set it when the host has its own reason to stand a page down — an interstitial covering the
   * screen, a wizard step that is mounted but not yet reached — or when there is no adapter and
   * this wrapper owns the decision itself.
   */
  active?: boolean;
  children?: React.ReactNode;
}

/**
 * Binds everything inside it to one page instance.
 *
 * This is what fixes construction-time ownership. Banners used to read the current page from a
 * module global that a parent effect wrote, but React effects run after commit — child first, then
 * parent — so a banner constructed in the same pass captured the *previous* page, permanently.
 * Moving the report to `useLayoutEffect` does not help: layout effects run child-first too. Context
 * is readable by the child during its own render, so no navigation side effect has to move into
 * render to beat the timing.
 *
 * The page handle is minted once per mounted route instance, so two article routes that share the
 * name "article" still own their banners separately.
 */
export function AudienzzPage({
  name,
  id,
  route,
  active = true,
  children,
}: AudienzzPageProps): React.ReactElement {
  // Identity. With a route it is DERIVED from the route key, so this wrapper and the adapter
  // compute the same id without coordinating — which is what stops a wrapper that mounts after its
  // route was already reported from manufacturing a second visit for it.
  const page = React.useMemo<AudienzzPageHandle>(() => {
    if (id != null) {
      return createPageInstance(id, name);
    }
    if (route != null) {
      return createPageInstance(route.key, name);
    }
    return createManagedPage(name);
  }, [id, route, name]);
  const [isActive, setIsActive] = React.useState(false);

  // Focus, re-read whenever the adapter moves it. Ownership and focus are different questions:
  // delayed content can legitimately bind its identity to a route the reader has already left, and
  // treating mounting as focus let a retained outgoing screen reactivate itself.
  const [focusTick, setFocusTick] = React.useState(0);
  React.useLayoutEffect(() => {
    if (route == null) {
      // A page with no route is not adapter-managed, so another route gaining focus says nothing
      // about it. Subscribing anyway made every such page re-activate on every navigation and
      // steal the current page from whichever screen the reader was actually on.
      return undefined;
    }
    return subscribeRouteFocus(() => setFocusTick((tick) => tick + 1));
  }, [route]);

  // With an adapter in use, the adapter decides which route is current; this wrapper only says
  // whether it is willing. Without one — a standalone screen, or the window before
  // `audienzzOnNavigationReady` — the wrapper owns the decision as before.
  const focused =
    route == null || !hasNavigationAdapterReported() || isRouteFocused(route.key);
  const shouldBeActive = active && focused;

  if (__DEV__ && route == null && id == null && hasNavigationAdapterReported()) {
    // Not a style preference: without one of these there is nothing tying this wrapper to a route,
    // so the adapter and this page would each own a different identity and release each other's
    // banners. Guessing the binding from callback order is what this replaced.
    console.warn(
      `[Audienzz] <AudienzzPage name="${name}"> is used with the navigation adapter but was given ` +
        'neither `route` nor `id`. Pass the `route` prop React Navigation hands your screen: ' +
        '<AudienzzPage name="…" route={route}>. Without it this page and the adapter cannot agree ' +
        'on which route owns this screen\'s banners.'
    );
  }

  // Bound to the route INSTANCE, not to whatever the adapter reports next. A layout effect so the
  // binding exists before NavigationContainer's passive effect calls onStateChange; and if the
  // adapter got there first with a fallback identity, binding repairs it.
  React.useLayoutEffect(() => {
    if (route == null) {
      return undefined;
    }
    bindWrapperToRoute(route.key, page);
    return () => unbindWrapperFromRoute(route.key, page);
  }, [route, page]);

  React.useLayoutEffect(() => () => releaseManagedPage(page), [page]);

  React.useEffect(() => {
    if (!shouldBeActive) {
      // Revoked, not sticky. A screen that is not focused — a retained tab, or a stack screen the
      // reader has navigated away from — must stop reporting itself as the active page: otherwise
      // a banner added to it afterwards is created as if it were on the foreground page, and it
      // can never be re-activated when the reader comes back.
      setIsActive(false);
      forgetManagedActivation(page);
      return;
    }
    // Reporting the page is a side effect and belongs in an effect. A managed banner does not
    // create its ad until `isActive` turns true, so the page is always reported before its ads
    // exist — the ordering contract holds without putting navigation work into render.
    activateManagedPage(page, (p) => Audienzz.activatePage(p));
    setIsActive(true);
    // focusTick participates so this re-runs when the adapter moves focus onto or off this route.
    // It is pinned for a routeless page, which never subscribes.
  }, [shouldBeActive, page, focusTick]);

  const value = React.useMemo<AudienzzPageContextValue>(
    () => ({ page, isActive }),
    [page, isActive]
  );

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}
