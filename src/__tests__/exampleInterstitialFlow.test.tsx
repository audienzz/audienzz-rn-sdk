import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { UIManager } from 'react-native';
import RemoteConfigExample from '../../example/src/components/RemoteConfigExample';

jest.mock(
  'audienzz',
  () => ({
    // Drive the real readiness mirror and command dispatch, not a mock isReady() result.
    RemoteConfigInterstitial: jest.requireActual(
      '../ads/original/RemoteConfigInterstitial'
    ).RemoteConfigInterstitial,
    RemoteConfigBanner: () => null,
  }),
  { virtual: true }
);

jest.mock('react-native', () => ({
  Platform: { select: (options: any) => options.default },
  StyleSheet: { create: (styles: any) => styles },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  requireNativeComponent: () => 'NativeInterstitial',
  findNodeHandle: jest.fn(() => 42),
  UIManager: {
    getViewManagerConfig: () => ({
      Commands: { prefetch: 0, prefetchAndShow: 1, show: 2, dispose: 3 },
    }),
    dispatchViewManagerCommand: jest.fn(),
  },
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('example manual interstitial flow', () => {
  let tree: renderer.ReactTestRenderer;
  const dispatch = UIManager.dispatchViewManagerCommand as jest.Mock;
  const native = () => tree.root.findByType('NativeInterstitial' as any);
  const lifecycle = (event: string, ready: boolean, reason?: string) => {
    act(() =>
      native().props.onLifecycleEvent({ nativeEvent: { event, ready, reason } })
    );
  };
  const callback = (name: string) => act(() => native().props[name]());
  const press = (label: string) => {
    const button = tree.root
      .findAllByType('TouchableOpacity' as any)
      .find((node) => node.findByType('Text' as any).props.children === label);
    expect(button).toBeDefined();
    act(() => button!.props.onPress());
  };
  const status = () =>
    tree.root.findAllByType('Text' as any).map((node) => node.props.children);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    act(() => {
      tree = renderer.create(<RemoteConfigExample />, {
        createNodeMock: () => ({}),
      });
    });
  });
  afterEach(() => {
    act(() => tree.unmount());
    jest.restoreAllMocks();
  });

  it('keeps cached inventory ready after a skipped show, without waiting for another callback', () => {
    press('Prefetch');
    expect(dispatch).toHaveBeenLastCalledWith(42, 0, []);
    expect(status()).toContain('loading…');
    lifecycle('loaded', true);
    callback('onAdLoaded');
    press('Show');
    expect(dispatch).toHaveBeenLastCalledWith(42, 2, [true]);
    lifecycle('opportunitySkipped', true, 'inactive');

    dispatch.mockClear();
    press('Prefetch');
    // No native callback follows a coalesced Android prefetch. Assert the actual visible status.
    expect(status()).toContain('ready to show — using prefetched ad');
    expect(status()).not.toContain('loading…');
    expect(dispatch).not.toHaveBeenCalled();
    press('Show');
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenLastCalledWith(42, 2, [true]);
  });

  it('requests and shows new inventory in each of three manual cycles', () => {
    for (let cycle = 1; cycle <= 3; cycle++) {
      press('Prefetch');
      expect(status()).toContain('loading…');
      lifecycle('loaded', true);
      callback('onAdLoaded');
      expect(status()).toContain('ready to show');
      press('Show');
      lifecycle('showAttempted', false);
      callback('onAdOpened');
      expect(status()).toContain('showing');
      lifecycle('dismissed', false);
      callback('onAdClosed');
      expect(status()).toContain('closed — not loaded');
      expect(dispatch.mock.calls.filter((call) => call[1] === 0)).toHaveLength(
        cycle
      );
      expect(dispatch.mock.calls.filter((call) => call[1] === 2)).toHaveLength(
        cycle
      );
    }
  });
});
