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

describe('RemoteConfigBanner delivery defaults', () => {
  it('imposes no lazy-load default of its own', () => {
    const props = nativeProps(<RemoteConfigBanner adConfigId="118" />);
    // Undefined is the contract: it means "unset", so the native SDK applies
    // the ad config and then its own default. A JS-side default would pin the
    // behaviour here and silently diverge from iOS/Android.
    expect(props.lazyLoad).toBeUndefined();
    expect(props.prefetchMargin).toBeUndefined();
  });

  it('forwards an explicit eager choice', () => {
    const props = nativeProps(
      <RemoteConfigBanner adConfigId="118" lazyLoad={false} />
    );
    expect(props.lazyLoad).toBe(false);
  });

  it('forwards an explicit lazy choice with a margin', () => {
    const props = nativeProps(
      <RemoteConfigBanner adConfigId="118" lazyLoad prefetchMargin={600} />
    );
    expect(props.lazyLoad).toBe(true);
    expect(props.prefetchMargin).toBe(600);
  });

  it('forwards a margin of zero rather than dropping it', () => {
    const props = nativeProps(
      <RemoteConfigBanner adConfigId="118" lazyLoad prefetchMargin={0} />
    );
    expect(props.prefetchMargin).toBe(0);
  });
});
