import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AudienzzPage, useAudienzzPage } from '../managed/AudienzzPage';
import { AudienzzBanner } from '../managed/AudienzzBanner';
import { Audienzz } from '../RNAudienzz';
import * as registry from '../pageRegistry';
import { audienzzOnNavigationStateChange, resetAudienzzNavigationTracking } from '../managed/navigation';
import { OriginalBanner } from '../ads/original/OriginalBanner';

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

  // Contract corrected after this review: the screen name IS the page identity by default, because
  // minting a fresh id per mount broke repeat reports and made the adapter and wrapper disagree.
  // Per-instance identity is opt-in on both sides — see 'separates two routes only when both sides
  // opt in' in managedBanner.test.tsx.
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('gives two routes with the same screen name different page ids', () => {
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

  it('defaults to lazy loading and forwards an explicit override', () => {
    const lazy = render(
      <AudienzzPage name="a">
        <AudienzzBanner adConfigId="46" slotKey="s" />
      </AudienzzPage>
    );
    expect(natives(lazy)[0]!.props.lazyLoad).toBe(true);

    const eager = render(
      <AudienzzPage name="a">
        <AudienzzBanner adConfigId="46" slotKey="s" lazyLoad={false} />
      </AudienzzPage>
    );
    expect(natives(eager)[0]!.props.lazyLoad).toBe(false);
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

  it('REVIEW: active=false revokes an already activated page', () => {
    let last: any;
    function Probe() { last = useAudienzzPage(); return null; }
    const tree = render(<AudienzzPage name="A" active><Probe /><AudienzzBanner adConfigId="46" slotKey="s" /></AudienzzPage>);
    expect(last.isActive).toBe(true);
    act(() => tree.update(<AudienzzPage name="A" active={false}><Probe /><AudienzzBanner adConfigId="46" slotKey="s" /></AudienzzPage>));
    expect(last.isActive).toBe(false);
  });

  it('REVIEW: navigation adapter and managed banner agree on page identity', () => {
    resetAudienzzNavigationTracking();
    const tree = render(<AudienzzPage name="Article"><AudienzzBanner adConfigId="46" slotKey="s" /></AudienzzPage>);
    const nativePage = natives(tree)[0]!.props.pageKey;
    act(() => audienzzOnNavigationStateChange({index:0,routes:[{key:'Article-route-1',name:'Article'}]}));
    expect(activated[activated.length - 1]!.id).toBe(nativePage);
  });

  it('REVIEW: banner added to an inactive retained page keeps explicit ownership', () => {
    const view = (showA: boolean, focusB: boolean) => <>
      <AudienzzPage name="A" active={!focusB}>{showA && <AudienzzBanner adConfigId="46" slotKey="a" />}</AudienzzPage>
      <AudienzzPage name="B" active={focusB}><AudienzzBanner adConfigId="46" slotKey="b" /></AudienzzPage>
    </>;
    const tree = render(view(false, false));
    const pageA = activated[0]!.id;
    act(() => tree.update(view(false, true)));
    act(() => tree.update(view(true, true)));
    const banners = natives(tree);
    expect(banners).toHaveLength(1); // A is inactive: its newly mounted child must not load.
    expect(banners.every(b => b.props.pageKey !== pageA)).toBe(true);
  });

  it('REVIEW: OriginalBanner still passes a string pageKey to native', () => {
    registry.setCurrentPage({ id:'article-id', name:'Article' });
    const tree = render(<OriginalBanner {...({adUnitId:'/test', auConfigId:'test', sizes:[{width:320,height:50}]} as any)} />);
    expect(natives(tree)[0]!.props.pageKey).toBe('article-id');
  });

});
