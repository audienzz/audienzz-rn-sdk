import React from 'react';
import renderer, { act } from 'react-test-renderer';
import {
  RemoteConfigInterstitial,
  type RemoteConfigInterstitialHandle,
} from '../ads/original/RemoteConfigInterstitial';

jest.mock('react-native', () => {
  return {
    Platform: { select: (options: any) => options.default },
    AppState: { currentState: 'active', addEventListener: jest.fn() },
    requireNativeComponent: () => 'MockInterstitial',
    findNodeHandle: jest.fn(() => 42),
    UIManager: {
      getViewManagerConfig: jest.fn(() => ({
        Commands: { prefetch: 0, prefetchAndShow: 1, show: 2, dispose: 3 },
      })),
      dispatchViewManagerCommand: jest.fn(),
    },
  };
});

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * `isReady()` mirrors the readiness NATIVE reports on each lifecycle event.
 *
 * It is deliberately not re-derived from event names — several native paths treat held inventory
 * differently on the same event — so every test here drives it through the `ready` flag the
 * bridges attach, exactly as native sends it.
 */
describe('RemoteConfigInterstitial isReady', () => {
  let tree: renderer.ReactTestRenderer;
  let ref: React.RefObject<RemoteConfigInterstitialHandle>;
  let now = 1_000_000;

  const nativeEmits = (event: string, ready: boolean) => {
    const native = tree.root.findByType('MockInterstitial' as any);
    act(() => native.props.onLifecycleEvent({ nativeEvent: { event, ready } }));
  };

  const mount = (props: Record<string, unknown> = {}) => {
    act(() => {
      tree = renderer.create(
        <RemoteConfigInterstitial ref={ref} adConfigId="267" manualControl {...props} />,
        { createNodeMock: () => ({}) }
      );
    });
  };

  beforeEach(() => {
    ref = React.createRef<RemoteConfigInterstitialHandle>();
    now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });
  afterEach(() => {
    act(() => tree.unmount());
    jest.restoreAllMocks();
  });

  it('is not ready before anything has loaded', () => {
    mount();
    expect(ref.current!.isReady()).toBe(false);
  });

  it('becomes ready when native reports it, and stops when native says so', () => {
    mount();
    nativeEmits('loaded', true);
    expect(ref.current!.isReady()).toBe(true);

    nativeEmits('presented', false);
    expect(ref.current!.isReady()).toBe(false);
  });

  it('follows native, not the event name', () => {
    // The whole reason readiness is carried rather than derived: the same event can leave
    // inventory held or not depending on the path native took.
    mount();
    nativeEmits('loaded', true);
    nativeEmits('showFailed', true);
    expect(ref.current!.isReady()).toBe(true);

    nativeEmits('showFailed', false);
    expect(ref.current!.isReady()).toBe(false);
  });

  it('expires after native inventory lifetime, even though native emits nothing then', () => {
    mount();
    nativeEmits('loaded', true);

    now += 3_600_000 - 1;
    expect(ref.current!.isReady()).toBe(true);
    now += 1;
    expect(ref.current!.isReady()).toBe(false);
  });

  it('a later ready event does not reset the lifetime clock', () => {
    // An unrelated event reporting ready=true must not make hour-old inventory look fresh.
    mount();
    nativeEmits('loaded', true);
    now += 3_000_000;
    nativeEmits('opportunitySkipped', true);
    now += 700_000;
    expect(ref.current!.isReady()).toBe(false);
  });

  it('works even when the publisher does not subscribe to lifecycle events', () => {
    // The native listener used to be attached only when onLifecycleEvent was passed.
    mount();
    nativeEmits('loaded', true);
    expect(ref.current!.isReady()).toBe(true);
  });

  it('still forwards every event to the publisher, with the ready flag', () => {
    const seen: unknown[] = [];
    mount({ onLifecycleEvent: (e: unknown) => seen.push(e) });
    nativeEmits('loaded', true);
    expect(seen).toEqual([{ event: 'loaded', ready: true }]);
  });

  it('is not ready after dispose', () => {
    mount();
    nativeEmits('loaded', true);
    act(() => ref.current!.dispose());
    expect(ref.current!.isReady()).toBe(false);
  });

  it('is not ready after switching to a different config', () => {
    // A new config is a new native owner holding nothing.
    mount();
    nativeEmits('loaded', true);
    act(() =>
      tree.update(
        <RemoteConfigInterstitial ref={ref} adConfigId="999" manualControl />
      )
    );
    expect(ref.current!.isReady()).toBe(false);
  });
});
