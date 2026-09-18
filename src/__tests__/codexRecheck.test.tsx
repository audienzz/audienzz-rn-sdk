import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { UIManager } from 'react-native';
import { AudienzzPage } from '../managed/AudienzzPage';
import {
  AudienzzBanner,
  type AudienzzBannerHandle,
} from '../managed/AudienzzBanner';
import { Audienzz } from '../RNAudienzz';
import * as registry from '../pageRegistry';
import {audienzzOnNavigationStateChange,resetAudienzzNavigationTracking} from '../managed/navigation';

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
      Commands: {
        stopAutoRefresh: 0,
        resumeAutoRefresh: 1,
        reload: 2,
        setCovered: 3,
      },
    })),
    dispatchViewManagerCommand: jest.fn(),
  },
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).__DEV__ = false;

/**
 * The blueprint requires a managed banner to expose custom cover reporting and a durable publisher
 * pause. Geometry and hit testing cannot see a pointer-transparent overlay.
 */
describe('managed banner publisher controls', () => {
  const dispatch = UIManager.dispatchViewManagerCommand as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(Audienzz, 'activatePage')
      .mockImplementation((page) => registry.setCurrentPage(page));
  });
  afterEach(() => jest.restoreAllMocks());

  function mount() {
    const ref = React.createRef<AudienzzBannerHandle>();
    act(() => {
      renderer.create(
        <AudienzzPage name="article">
          <AudienzzBanner ref={ref} adConfigId="118" slotKey="one" />
        </AudienzzPage>,
        { createNodeMock: () => ({}) }
      );
    });
    return ref;
  }

  it('reports a cover and can clear it', () => {
    const ref = mount();
    act(() => ref.current!.reportCover(true));
    expect(dispatch).toHaveBeenLastCalledWith(42, 3, [true]);

    act(() => ref.current!.reportCover(false));
    expect(dispatch).toHaveBeenLastCalledWith(42, 3, [false]);
  });

  it('exposes a durable publisher pause separate from the cover', () => {
    const ref = mount();
    act(() => ref.current!.stopAutoRefresh());
    expect(dispatch).toHaveBeenLastCalledWith(42, 0, []);

    act(() => ref.current!.resumeAutoRefresh());
    expect(dispatch).toHaveBeenLastCalledWith(42, 1, []);
  });

  it('is usable without a ref', () => {
    act(() => {
      renderer.create(
        <AudienzzPage name="article">
          <AudienzzBanner adConfigId="118" slotKey="one" />
        </AudienzzPage>,
        { createNodeMock: () => ({}) }
      );
    });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('RECHECK publisher stop survives a retained-page deactivation and return', () => {
    const ref=React.createRef<AudienzzBannerHandle>();
    const page=(active:boolean)=><AudienzzPage name="A" active={active}><AudienzzBanner ref={ref} adConfigId="118" slotKey="one" /></AudienzzPage>;
    let tree!:renderer.ReactTestRenderer;
    act(()=>{tree=renderer.create(page(true),{createNodeMock:()=>({})});});
    act(()=>ref.current!.stopAutoRefresh());
    expect(dispatch).toHaveBeenLastCalledWith(42,0,[]);
    act(()=>tree.update(page(false)));
    dispatch.mockClear();
    act(()=>tree.update(page(true)));
    expect(dispatch).toHaveBeenCalledWith(42,0,[]);
  });
  it('RECHECK wrapper plus adapter reports a single activation', () => {
    resetAudienzzNavigationTracking();
    mount();
    act(()=>audienzzOnNavigationStateChange({index:0,routes:[{key:'article-route',name:'article'}]}));
    expect(Audienzz.activatePage).toHaveBeenCalledTimes(1);
  });
});
