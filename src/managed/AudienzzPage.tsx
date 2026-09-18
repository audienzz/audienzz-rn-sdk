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
  claimManagedPage,
  createManagedPage,
  createPageInstance,
  forgetManagedActivation,
  releaseManagedPage,
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
   * Page identity, when it must differ from the name — two article routes that should own their
   * banners separately, for example.
   *
   * Opt-in on **both** sides: pass `{ perInstance: true }` to `audienzzOnNavigationStateChange`
   * and the same key here, or the adapter and this wrapper will disagree about which page a banner
   * is on and each will release the other's banners. With React Navigation, use `route.key`.
   */
  id?: string;
  /**
   * Whether this page currently owns the screen. Defaults to `true`, which is correct for a plain
   * stack where mounting *is* navigating. With a tab or nested navigator, pass focus — e.g. React
   * Navigation's `useIsFocused()` — so a pre-mounted screen does not claim the active page.
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
  active = true,
  children,
}: AudienzzPageProps): React.ReactElement {
  // Resolved during render, so a child sees it in the same commit. A rebuild never changes it.
  // Unique by default. Two article routes must own their banners separately without the publisher
  // configuring matching ids in two places; the adapter defers to this handle.
  const page = React.useMemo<AudienzzPageHandle>(
    () => (id == null ? createManagedPage(name) : createPageInstance(id, name)),
    [id, name]
  );
  const [isActive, setIsActive] = React.useState(false);

  // Layout effects run before passive effects, and NavigationContainer calls onStateChange from a
  // passive one — so the claim is in place before the adapter looks for it, whichever mounts first.
  React.useLayoutEffect(() => {
    if (!active) {
      return undefined;
    }
    claimManagedPage(page);
    return () => releaseManagedPage(page);
  }, [active, page]);

  React.useEffect(() => {
    if (!active) {
      // Revoked, not sticky. A retained tab that loses focus must stop reporting itself as the
      // active page: otherwise a banner added to it afterwards is created as if it were on the
      // foreground page, and the tab can never be re-activated when the reader comes back.
      setIsActive(false);
      forgetManagedActivation(page);
      return;
    }
    // Reporting the page is a side effect and belongs in an effect. A managed banner does not
    // create its ad until `isActive` turns true, so the page is always reported before its ads
    // exist — the ordering contract holds without putting navigation work into render.
    activateManagedPage(page, (p) => Audienzz.activatePage(p));
    setIsActive(true);
  }, [active, page]);

  const value = React.useMemo<AudienzzPageContextValue>(
    () => ({ page, isActive }),
    [page, isActive]
  );

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}
