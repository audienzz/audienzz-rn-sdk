import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Audienzz } from '../RNAudienzz';
import * as registry from '../pageRegistry';
import ReloadTabsExample from '../../example/src/components/ReloadTabsExample';

/**
 * Adopted from the independent audit probe, which imports the REAL example screen and the REAL
 * `OriginalBanner`. Only the fixture changed: the example reports through its page wrappers rather
 * than a bare `pageImpression` call, so the spy moves to `activatePage`.
 *
 * What it establishes: two retained tabs are two pages. Both banners stay mounted — that is what
 * the example exists to show — and each carries the identity of the tab it is actually on, so
 * exactly one of them matches the active page after a tab switch. Before this, both captured
 * whichever page happened to be current when they mounted, so after switching neither matched and
 * native coordination released both.
 */
jest.mock(
  'audienzz',
  () => ({
    __esModule: true,
    default: () => require('../RNAudienzz').Audienzz,
    OriginalBanner: require('../ads/original/OriginalBanner').OriginalBanner,
    AudienzzPage: require('../managed/AudienzzPage').AudienzzPage,
  }),
  { virtual: true }
);
// The example's constants module reads `Platform` from the example's OWN react-native copy, which
// resolves to a different module instance than the one mocked below. Only the ad ids matter here,
// so the module is stubbed with the real values for the unit this screen uses.
jest.mock('../../example/src/ads_constants', () => ({
  ADS: {
    ORIGINAL_BANNER_HTML_300_250: {
      adUnitId: '/96628199/de_audienzz.ch_v2/multi-size',
      auConfigId: 'wuobgeuc',
      sizes: [
        { width: 300, height: 250 },
        { width: 320, height: 50 },
      ],
    },
  },
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios', select: (o: any) => o.default },
  Dimensions: { get: () => ({ width: 390, height: 844 }) },
  requireNativeComponent: () => 'MockNativeBanner',
  findNodeHandle: jest.fn(() => 42),
  StyleSheet: { create: (s: any) => s },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  SafeAreaView: 'SafeAreaView',
  DeviceEventEmitter: { addListener: jest.fn() },
  NativeModules: {},
  UIManager: {
    getViewManagerConfig: () => ({ Commands: { reload: 0 } }),
    dispatchViewManagerCommand: jest.fn(),
  },
}));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).__DEV__ = false;

describe('actual example ownership', () => {
  let tree: renderer.ReactTestRenderer | undefined;
  afterEach(() => {
    if (tree) act(() => tree!.unmount());
    tree = undefined;
    jest.restoreAllMocks();
  });

  it('each retained tab owns its own banner, and one matches the active page', () => {
    registry.resetManagedPagesForTesting();
    jest
      .spyOn(Audienzz, 'activatePage')
      .mockImplementation((page) => registry.setCurrentPage(page));

    act(() => {
      tree = renderer.create(<ReloadTabsExample onBack={() => {}} />, {
        createNodeMock: () => ({}),
      });
    });
    const nativeBanners = () =>
      tree!.root.findAllByType('MockNativeBanner' as any);

    expect(nativeBanners()).toHaveLength(2);
    // Each banner carries ITS OWN tab, not whatever page was current at mount.
    expect(nativeBanners().map((node) => node.props.pageKey)).toEqual([
      'reloadTabA',
      'reloadTabB',
    ]);
    expect(registry.getCurrentPage()?.id).toBe('reloadTabA');
    expect(
      nativeBanners().filter(
        (node) => node.props.pageKey === registry.getCurrentPage()?.id
      )
    ).toHaveLength(1);

    const buttons = tree!.root.findAllByType('TouchableOpacity' as any);
    act(() => buttons[2]!.props.onPress()); // Back, A, B
    expect(registry.getCurrentPage()?.id).toBe('reloadTabB');
    expect(nativeBanners()).toHaveLength(2); // Kept mounted as advertised.
    expect(
      nativeBanners().filter(
        (node) => node.props.pageKey === registry.getCurrentPage()?.id
      )
    ).toHaveLength(1);
  });
});
