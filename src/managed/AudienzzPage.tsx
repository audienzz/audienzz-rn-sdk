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
import { createPage, type AudienzzPageHandle } from '../pageRegistry';
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
  /** Analytics screen name. It may repeat across routes; identity is minted separately. */
  name: string;
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
  active = true,
  children,
}: AudienzzPageProps): React.ReactElement {
  // Created during render, so a child sees it in the same commit. Never recreated by a rebuild.
  const [page] = React.useState(() => createPage(name));
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    if (!active) {
      return;
    }
    // Reporting the page is a side effect and belongs in an effect. A managed banner does not
    // create its ad until `isActive` turns true, so the page is always reported before its ads
    // exist — the ordering contract holds without putting navigation work into render.
    Audienzz.activatePage(page);
    setIsActive(true);
  }, [active, page]);

  const value = React.useMemo<AudienzzPageContextValue>(
    () => ({ page, isActive }),
    [page, isActive]
  );

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}
