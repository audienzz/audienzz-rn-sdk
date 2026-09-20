import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AudienzzPage } from '../managed/AudienzzPage';
import { AudienzzBanner } from '../managed/AudienzzBanner';
import {
  audienzzOnNavigationStateChange,
  resetAudienzzNavigationTracking,
} from '../managed/navigation';
import { Audienzz } from '../RNAudienzz';
import * as registry from '../pageRegistry';

jest.mock('react-native', () => ({
  Platform: { select: (o: any) => o.default },
  requireNativeComponent: () => 'MockRemoteConfigBanner',
  findNodeHandle: jest.fn(() => 42),
  StyleSheet: {
    create: (s: any) => s,
    flatten: (s: any) =>
      Array.isArray(s) ? Object.assign({}, ...s.filter(Boolean)) : s ?? {},
  },
  View: 'View',
  DeviceEventEmitter: { addListener: jest.fn() },
  NativeModules: {},
  UIManager: {
    getViewManagerConfig: jest.fn(() => ({
      Commands: { stopAutoRefresh: 0, resumeAutoRefresh: 1, reload: 2, setCovered: 3 },
    })),
    dispatchViewManagerCommand: jest.fn(),
  },
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).__DEV__ = false;

/**
 * Ownership and focus are different questions. A wrapper says which page a screen's banners belong
 * to; the navigation adapter says which screen the reader is on. Treating mounting as focus let a
 * retained outgoing screen reactivate itself, and deriving a second identity for an
 * already-reported route counted one visit twice.
 */
describe('managed page focus', () => {
  let activated: Array<{ id: string; name: string }>;
  let tree: renderer.ReactTestRenderer | undefined;

  beforeEach(() => {
    registry.resetManagedPagesForTesting();
    resetAudienzzNavigationTracking();
    activated = [];
    jest.spyOn(Audienzz, 'activatePage').mockImplementation((p) => {
      activated.push({ id: p.id, name: p.name });
      registry.setCurrentPage(p);
    });
  });
  afterEach(() => {
    if (tree) act(() => tree!.unmount());
    tree = undefined;
    jest.restoreAllMocks();
  });

  const nav = (...keys: string[]) =>
    audienzzOnNavigationStateChange({
      index: keys.length - 1,
      routes: keys.map((key) => ({ key, name: key === 'settings' ? 'Settings' : 'Article' })),
    });

  const screen = (key: string, name = 'Article') => (
    <AudienzzPage key={key} name={name} route={{ key }}>
      <AudienzzBanner adConfigId="118" slotKey="one" />
    </AudienzzPage>
  );

  const natives = () =>
    tree!.root.findAllByType('MockRemoteConfigBanner' as any);

  it('an analytics name of its own does not make a reported route a second visit', () => {
    // The adapter reports the ROUTER's screen name; a wrapper may prefer a different analytics
    // name for the same screen. The id identifies the visit, so this is still one page impression.
    act(() => nav('a'));
    expect(activated).toHaveLength(1);
    expect(activated[0]!.name).toBe('Article');

    act(() => {
      tree = renderer.create(screen('a', 'article-detail'), {
        createNodeMock: () => ({}),
      });
    });

    expect(activated).toHaveLength(1);
  });

  it('a retained screen becomes active again when focus returns to it', () => {
    // A real push: A exists and is reported, then B mounts and is reported. Mounting both before
    // any navigation report is not a stack — with no report there is no notion of focus yet, and
    // each wrapper would rightly consider itself current.
    act(() => {
      tree = renderer.create(<>{screen('a')}</>, { createNodeMock: () => ({}) });
    });
    act(() => nav('a'));
    expect(natives().map((n) => n.props.pageKey)).toContain('a');

    act(() => tree!.update(<>{screen('a')}{screen('b')}</>));
    act(() => nav('a', 'b'));
    expect(natives().map((n) => n.props.pageKey)).toContain('b');

    // Back to A. Without a focus notification its wrapper never re-evaluates, so its banner stays
    // dormant on the screen the reader is now looking at.
    act(() => nav('a'));
    expect(activated.map((p) => p.id)).toEqual(['a', 'b', 'a']);
    expect(natives().map((n) => n.props.pageKey)).toContain('a');
  });
});
