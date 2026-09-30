import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AudienzzPage } from '../managed/AudienzzPage';
import { AudienzzBanner } from '../managed/AudienzzBanner';
import { Audienzz } from '../RNAudienzz';
import * as registry from '../pageRegistry';

jest.mock('react-native', () => ({
  Platform: { select: (o: any) => o.default },
  requireNativeComponent: () => 'MockRemoteConfigBanner',
  findNodeHandle: jest.fn(() => 42),
  StyleSheet: {
    create: (s: any) => s,
    flatten: (s: any) => (Array.isArray(s) ? Object.assign({}, ...s.filter(Boolean)) : s ?? {}),
  },
  View: 'View',
  DeviceEventEmitter: { addListener: jest.fn(), emit: jest.fn() },
  NativeModules: {},
  UIManager: {
    getViewManagerConfig: jest.fn(() => ({
      Commands: { stopAutoRefresh: 0, resumeAutoRefresh: 1, reload: 2 },
    })),
    dispatchViewManagerCommand: jest.fn(),
  },
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).__DEV__ = false;

/**
 * The ordering bug this component exists to remove: a banner used to read the current page from a
 * module global written by a parent effect, but effects run child-first, so the child captured the
 * previous page during its own construction.
 */
describe('managed RemoteBanner integration', () => {
  let activated: Array<{ id: string; name: string }>;

  beforeEach(() => {
    activated = [];
    jest
      .spyOn(Audienzz, 'activatePage')
      .mockImplementation((page) => {
        activated.push({ id: page.id, name: page.name });
        registry.setCurrentPage(page);
      });
  });

  afterEach(() => jest.restoreAllMocks());

  function render(element: React.ReactElement) {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(element, { createNodeMock: () => ({}) });
    });
    return tree;
  }

  const natives = (tree: renderer.ReactTestRenderer) =>
    tree.root.findAllByType('MockRemoteConfigBanner' as any);

  it('reports the page before the banner is created', () => {
    const tree = render(
      <AudienzzPage name="article">
        <AudienzzBanner adConfigId="46" slotKey="in-content-1" />
      </AudienzzPage>
    );
    expect(activated).toHaveLength(1);
    expect(natives(tree)).toHaveLength(1);
    // The native view carries the page instance id, not the display name.
    expect(natives(tree)[0]!.props.pageKey).toBe(activated[0]!.id);
  });

  it('gives two managed routes with one screen name separate pages', () => {
    // Unique by default for MANAGED pages. Legacy pageImpression(name) keeps name identity so a
    // repeat report still refreshes rather than releases — compatibility is preserved at the old
    // API boundary, not by weakening this one.
    render(
      <AudienzzPage name="article">
        <AudienzzBanner adConfigId="46" slotKey="s" />
      </AudienzzPage>
    );
    render(
      <AudienzzPage name="article">
        <AudienzzBanner adConfigId="46" slotKey="s" />
      </AudienzzPage>
    );
    expect(activated.map((p) => p.name)).toEqual(['article', 'article']);
    expect(activated[0]!.id).not.toBe(activated[1]!.id);
  });

  it('accepts an explicit id from a custom router', () => {
    const tree = render(
      <AudienzzPage name="article" id="Article-a">
        <AudienzzBanner adConfigId="46" slotKey="s" />
      </AudienzzPage>
    );
    render(
      <AudienzzPage name="article" id="Article-b">
        <AudienzzBanner adConfigId="46" slotKey="s" />
      </AudienzzPage>
    );
    expect(activated.map((p) => p.id)).toEqual(['Article-a', 'Article-b']);
    expect(activated.map((p) => p.name)).toEqual(['article', 'article']);
    // And the banner is bound to its own page, not to whichever is current.
    expect(natives(tree)[0]!.props.pageKey).toBe('Article-a');
  });

  it('reserves the slot but creates nothing while the page is inactive', () => {
    const tree = render(
      <AudienzzPage name="tab-b" active={false}>
        <AudienzzBanner adConfigId="46" slotKey="s" placeholderHeight={300} />
      </AudienzzPage>
    );
    expect(activated).toHaveLength(0);
    expect(natives(tree)).toHaveLength(0);
    const slot = tree.root.findAllByType('View' as any)[0]!;
    expect(
      ([] as any[]).concat(slot.props.style).some((s) => s?.minHeight === 300)
    ).toBe(true);
  });

  it('creates the ad once the pre-mounted page becomes active', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <AudienzzPage name="tab-b" active={false}>
          <AudienzzBanner adConfigId="46" slotKey="s" />
        </AudienzzPage>,
        { createNodeMock: () => ({}) }
      );
    });
    expect(natives(tree)).toHaveLength(0);

    act(() => {
      tree.update(
        <AudienzzPage name="tab-b" active>
          <AudienzzBanner adConfigId="46" slotKey="s" />
        </AudienzzPage>
      );
    });
    expect(activated).toHaveLength(1);
    expect(natives(tree)).toHaveLength(1);
  });

  it('an ordinary rebuild keeps the same slot identity', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <AudienzzPage name="article">
          <AudienzzBanner adConfigId="46" slotKey="s" />
        </AudienzzPage>,
        { createNodeMock: () => ({}) }
      );
    });
    const before = natives(tree)[0]!.props.pageKey;

    act(() => {
      tree.update(
        <AudienzzPage name="article">
          <AudienzzBanner adConfigId="46" slotKey="s" placeholderHeight={120} />
        </AudienzzPage>
      );
    });

    expect(activated).toHaveLength(1);
    expect(natives(tree)).toHaveLength(1);
    expect(natives(tree)[0]!.props.pageKey).toBe(before);
  });

  it('leaves lazy loading and the margin to the ad config', () => {
    // Backend-driven only. A JS default here (it used to be `lazyLoad = true`) overrode a backend
    // `lazyLoad: false` for every managed slot.
    const tree = render(
      <AudienzzPage name="a">
        <AudienzzBanner adConfigId="46" slotKey="s" />
      </AudienzzPage>
    );
    expect(natives(tree)[0]!.props).not.toHaveProperty('lazyLoad');
    expect(natives(tree)[0]!.props).not.toHaveProperty('prefetchMargin');
  });

  it('a banner binds to its own page, not to whichever was activated last', () => {
    // Two pages mounted and active at once — a publisher who has not wired focus into `active`, or
    // an overlay over a screen. The second one activates last, so the global current page is B.
    // A banner added to A afterwards must still belong to A.
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <>
          <AudienzzPage name="A" id="page-a" />
          <AudienzzPage name="B" id="page-b" />
        </>,
        { createNodeMock: () => ({}) }
      );
    });
    expect(activated.map((p) => p.id)).toEqual(['page-a', 'page-b']);

    act(() => {
      tree.update(
        <>
          <AudienzzPage name="A" id="page-a">
            <AudienzzBanner adConfigId="46" slotKey="late" />
          </AudienzzPage>
          <AudienzzPage name="B" id="page-b" />
        </>
      );
    });

    expect(natives(tree)).toHaveLength(1);
    expect(natives(tree)[0]!.props.pageKey).toBe('page-a');
  });

  it('two slots on one page are distinguishable by slot key alone', () => {
    const tree = render(
      <AudienzzPage name="article">
        <AudienzzBanner adConfigId="46" slotKey="top" />
        <AudienzzBanner adConfigId="46" slotKey="bottom" />
      </AudienzzPage>
    );
    expect(natives(tree)).toHaveLength(2);
    expect(activated).toHaveLength(1);
  });
});
