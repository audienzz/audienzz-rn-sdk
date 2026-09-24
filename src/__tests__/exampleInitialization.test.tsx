import React from 'react';
import renderer, { act } from 'react-test-renderer';
import RNAudienzz, { audienzzOnNavigationReady } from 'audienzz';

jest.mock(
  'audienzz',
  () => {
    const sdk = {
      initializeRemote: jest.fn(),
      setDiagnosticsEnabled: jest.fn(),
      setSmartRefreshV2Enabled: jest.fn(),
      setBlankOnScreenReload: jest.fn(),
    };
    return {
      __esModule: true,
      default: () => sdk,
      Audienzz: sdk,
      RNTargeting: () => ({ addGlobalTargeting: jest.fn() }),
      audienzzOnNavigationReady: jest.fn(),
      audienzzOnNavigationStateChange: jest.fn(),
      logAppAction: jest.fn(),
    };
  },
  { virtual: true }
);
jest.mock('react-native', () => ({
  Platform: { OS: 'android', select: (options: any) => options.android },
  StyleSheet: { create: (styles: any) => styles, hairlineWidth: 1 },
  SafeAreaView: 'SafeAreaView',
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
}));
jest.mock('../../example/src/constants', () => ({ LOREM: '' }));

// Exercise the actual startup screen; ads themselves are outside this startup test.
for (const component of [
  'ErrorHandlingExample',
  'OriginalBannerAPIExample',
  'OriginalInterstitialAPIExample',
  'OriginalRewardedAPIExample',
  'LazyLoadingExample',
  'RenderingInterstitialAPIExample',
  'StickyAdExample',
  'LegacyOriginalView_v0_3_8',
  'TestScreenExample',
  'ReloadTabsExample',
]) {
  jest.doMock(`../../example/src/components/${component}`, () => () => null);
}
const mockMountMain = jest.fn();
jest.mock('../../example/src/components/RemoteConfigExample', () => () => {
  mockMountMain();
  return null;
});
const App = require('../../example/src/App').default;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('example initialization UI', () => {
  let tree: renderer.ReactTestRenderer | undefined;
  const initialize = RNAudienzz().initializeRemote as jest.Mock;
  const success = { status: 'SUCCEEDED', description: 'ready' };
  const text = () =>
    tree!.root
      .findAllByType('Text' as any)
      .map((node) => node.props.children)
      .flat()
      .join(' ');
  const buttons = () => tree!.root.findAllByType('TouchableOpacity' as any);

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] });
    jest.clearAllMocks();
    initialize.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    if (tree) act(() => tree!.unmount());
    tree = undefined;
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('shows a certificate failure and retries only after the failed attempt settled', async () => {
    const error = Object.assign(
      new Error('Trust anchor for certification path not found'),
      {
        code: 'FETCH_FAILED',
      }
    );
    initialize.mockRejectedValueOnce(error).mockResolvedValueOnce(success);
    await act(async () => {
      tree = renderer.create(<App />);
    });
    expect(text()).toContain('FETCH_FAILED');
    expect(text()).toContain('Trust anchor for certification path not found');
    expect(text()).toContain('Charles SSL Proxying');
    expect(text()).toContain('Retry initialization');
    expect(mockMountMain).not.toHaveBeenCalled();
    expect(audienzzOnNavigationReady).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
    await act(async () => {
      buttons()[0]!.props.onPress();
    });
    expect(initialize).toHaveBeenCalledTimes(2);
    expect(audienzzOnNavigationReady).toHaveBeenCalledTimes(1);
    expect(mockMountMain).toHaveBeenCalledTimes(1);
    expect(
      (audienzzOnNavigationReady as jest.Mock).mock.invocationCallOrder[0]
    ).toBeLessThan(mockMountMain.mock.invocationCallOrder[0]!);
  });

  it('makes a missing callback visible without retrying in parallel or treating it as success', async () => {
    let resolve!: (value: typeof success) => void;
    initialize.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        })
    );
    await act(async () => {
      tree = renderer.create(<App />);
    });
    expect(text()).toContain('Initializing SDK...');
    act(() => jest.advanceTimersByTime(30_000));
    expect(text()).toContain('taking longer than expected');
    expect(text()).toContain('Initialization is still pending');
    expect(buttons()).toHaveLength(0);
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(audienzzOnNavigationReady).not.toHaveBeenCalled();
    expect(mockMountMain).not.toHaveBeenCalled();
    // The warning must not poison a delayed successful callback.
    await act(async () => {
      resolve(success);
    });
    expect(audienzzOnNavigationReady).toHaveBeenCalledTimes(1);
    expect(mockMountMain).toHaveBeenCalledTimes(1);
  });

  it('cancels the warning on unmount and ignores a late native callback', async () => {
    let resolve!: (value: typeof success) => void;
    initialize.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        })
    );
    await act(async () => {
      tree = renderer.create(<App />);
    });
    expect(jest.getTimerCount()).toBe(1);
    act(() => tree!.unmount());
    tree = undefined;
    expect(jest.getTimerCount()).toBe(0);
    await act(async () => {
      resolve(success);
    });
    expect(audienzzOnNavigationReady).not.toHaveBeenCalled();
  });

  it('clears the warning timer when initialization succeeds promptly', async () => {
    initialize.mockResolvedValueOnce(success);
    await act(async () => {
      tree = renderer.create(<App />);
    });
    expect(mockMountMain).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });
});
