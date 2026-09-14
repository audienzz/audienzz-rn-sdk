import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AppState, UIManager, findNodeHandle } from 'react-native';
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
        Commands: { show: 0, preload: 1, showAtOpportunity: 2, dispose: 3 },
      })),
      dispatchViewManagerCommand: jest.fn(),
    },
  };
});

// React 19's renderer requires act; tests exercise the real component/ref, not a mirror.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('RemoteConfigInterstitial commands', () => {
  let tree: renderer.ReactTestRenderer;
  let ref: React.RefObject<RemoteConfigInterstitialHandle>;
  const dispatch = UIManager.dispatchViewManagerCommand as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    ref = React.createRef<RemoteConfigInterstitialHandle>();
    act(() => {
      tree = renderer.create(
        <RemoteConfigInterstitial ref={ref} adConfigId="267" manualControl />,
        { createNodeMock: () => ({}) }
      );
    });
  });
  afterEach(() => {
    act(() => tree.unmount());
  });

  it('does not load or show on mount or ordinary prop updates', () => {
    act(() =>
      tree.update(
        <RemoteConfigInterstitial
          ref={ref}
          adConfigId="267"
          manualControl
          onAdLoaded={() => {}}
        />
      )
    );
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('routes all commands and preserves the current eligibility value', () => {
    ref.current!.preload();
    ref.current!.showAtOpportunity(false);
    ref.current!.showAtOpportunity(true);
    ref.current!.show();
    ref.current!.dispose();
    expect(dispatch.mock.calls).toEqual([
      [42, 1, []],
      [42, 2, [false]],
      [42, 2, [true]],
      [42, 0, []],
      [42, 3, []],
    ]);
  });

  it('never retries an opportunity when an ad later loads and owns no lifecycle listener', () => {
    const loaded = jest.fn();
    act(() =>
      tree.update(
        <RemoteConfigInterstitial
          ref={ref}
          adConfigId="267"
          manualControl
          onAdLoaded={loaded}
        />
      )
    );
    ref.current!.showAtOpportunity(true);
    act(() => {
      tree.root
        .findByType('MockInterstitial' as any)
        .props.onAdLoaded({ nativeEvent: {} });
      // The component owns no AppState subscription or pending-show intent.
      expect(AppState.addEventListener).not.toHaveBeenCalled();
    });
    expect(loaded).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('forwards diagnostic payloads without the native event wrapper', () => {
    const failure = jest.fn();
    const showFailure = jest.fn();
    const lifecycle = jest.fn();
    act(() =>
      tree.update(
        <RemoteConfigInterstitial
          ref={ref}
          adConfigId="267"
          manualControl
          onAdFailedToLoad={failure}
          onAdFailedToShow={showFailure}
          onLifecycleEvent={lifecycle}
        />
      )
    );
    const props = tree.root.findByType('MockInterstitial' as any).props;
    const error = { code: 3, message: 'no fill', domain: 'Google' };
    props.onAdFailedToLoad({ nativeEvent: error });
    props.onAdFailedToShow({ nativeEvent: error });
    props.onLifecycleEvent({
      nativeEvent: { event: 'opportunitySkipped', reason: 'notReady' },
    });
    expect(failure).toHaveBeenCalledWith(error);
    expect(showFailure).toHaveBeenCalledWith(error);
    expect(lifecycle).toHaveBeenCalledWith({
      event: 'opportunitySkipped',
      reason: 'notReady',
    });
  });

  it('does not dispatch without an attached native view', () => {
    (findNodeHandle as jest.Mock).mockReturnValueOnce(null);
    ref.current!.preload();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('supports string commands when the manager has no numeric command map', () => {
    (UIManager.getViewManagerConfig as jest.Mock).mockReturnValueOnce({
      Commands: {},
    });
    act(() =>
      tree.update(
        <RemoteConfigInterstitial ref={ref} adConfigId="267" manualControl />
      )
    );
    ref.current!.showAtOpportunity(false);
    expect(dispatch).toHaveBeenCalledWith(42, 'showAtOpportunity', [false]);
  });
});
