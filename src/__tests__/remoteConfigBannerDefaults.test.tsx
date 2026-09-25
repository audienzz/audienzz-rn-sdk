import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { RemoteConfigBanner } from '../ads/original/RemoteConfigBanner';

jest.mock('react-native', () => ({
  Platform: { select: (options: any) => options.default },
  requireNativeComponent: () => 'MockRemoteConfigBanner',
  findNodeHandle: jest.fn(() => 42),
  StyleSheet: {
    create: (s: any) => s,
    flatten: (s: any) => (Array.isArray(s) ? Object.assign({}, ...s) : s ?? {}),
  },
  View: 'View',
  DeviceEventEmitter: { addListener: jest.fn(), emit: jest.fn() },
  NativeModules: {},
  NativeEventEmitter: class {
    addListener() {
      return { remove: () => {} };
    }
    removeAllListeners() {}
  },
  UIManager: {
    getViewManagerConfig: jest.fn(() => ({
      Commands: { stopAutoRefresh: 0, resumeAutoRefresh: 1, reload: 2 },
    })),
    dispatchViewManagerCommand: jest.fn(),
  },
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

/** The props actually handed to the native component. */
function nativeProps(element: React.ReactElement): Record<string, unknown> {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(element, { createNodeMock: () => ({}) });
  });
  const native = tree!.root.findByType('MockRemoteConfigBanner' as any);
  return native.props as Record<string, unknown>;
}

describe('RemoteConfigBanner delivery settings', () => {
  it('sends no lazy-load or margin prop: both come from the ad config', () => {
    const props = nativeProps(<RemoteConfigBanner adConfigId="118" />);
    // Backend-driven only: the native SDK applies the ad config's `lazyLoad` and
    // `prefetchDistanceDp`, then its own defaults. Nothing on the JS side may pin them.
    expect(props).not.toHaveProperty('lazyLoad');
    expect(props).not.toHaveProperty('prefetchMargin');
  });
});

describe('RemoteConfigBanner loaded dimensions', () => {
  it.each([{ width: '100%' }, { width: 300, height: 250 }])(
    'fits the native view to successive creative sizes with style %j',
    (style) => {
      let tree!: renderer.ReactTestRenderer;
      act(() => { tree = renderer.create(<RemoteConfigBanner adConfigId="46" style={style as any} />); });
      for (const size of [{ width: 300, height: 250 }, { width: 320, height: 50 }, { width: 300, height: 600 }]) {
        act(() => {
          tree.root.findByType('MockRemoteConfigBanner' as any).props.onAdLoaded({ nativeEvent: size });
        });
        const outer = tree.root.findByType('View' as any);
        const resolvedStyle = Object.assign({}, ...outer.props.style);
        expect(resolvedStyle.height).toBe(size.height);
        expect(resolvedStyle.width).toBe(typeof style.width === 'number' ? size.width : '100%');
        const native = tree.root.findByType('MockRemoteConfigBanner' as any);
        expect(native.props.style.height).toBe('100%');
      }
      act(() => { tree.unmount(); });
    }
  );
});
