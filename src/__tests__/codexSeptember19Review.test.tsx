import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AudienzzPage } from '../managed/AudienzzPage';
import {
  AudienzzBanner,
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


describe('route binding lifecycle review',()=>{
 let pages:registry.AudienzzPageHandle[];
 let tree:renderer.ReactTestRenderer|undefined;
 beforeEach(()=>{
   registry.resetManagedPagesForTesting(); resetAudienzzNavigationTracking(); pages=[];
   jest.spyOn(Audienzz,'activatePage').mockImplementation(p=>{pages.push(p); registry.setCurrentPage(p);});
 });
 afterEach(()=>{if(tree) act(()=>tree!.unmount());tree=undefined;jest.restoreAllMocks();});
 // React Navigation hands every screen its `route`; passing it is what binds this wrapper to that
 // route instance. Without it the SDK would have to infer the binding from callback order, which is
 // precisely the defect these cases reproduce. Only the fixture changes; no assertion does.
 const screen=(key:string)=><AudienzzPage key={key} name="article" route={{key}}><AudienzzBanner adConfigId="118" slotKey="one"/></AudienzzPage>;
 const nav=(...keys:string[])=>audienzzOnNavigationStateChange({index:keys.length-1,routes:keys.map(key=>({key,name:key==='settings'?'Settings':'Article'}))});
 it('initial wrapper must not claim the first ad-free destination',()=>{
   act(()=>{tree=renderer.create(screen('a'),{createNodeMock:()=>({})});});
   expect(pages).toHaveLength(0);
   // README wires only onStateChange; React Navigation does not emit it on initial render, which
   // is why onReady exists. Here the first thing the adapter ever sees is an ad-free destination:
   // the article wrapper's handle must not be handed to it.
   act(()=>nav('a','settings'));
   expect(pages).toHaveLength(1);
   expect(pages.at(-1)!.id).toBe('settings');
   expect(pages.at(-1)!.name).toBe('Settings');
 });
 it('a retained initial route returns to its own wrapper identity',()=>{
   act(()=>{tree=renderer.create(<>{screen('a')}</>,{createNodeMock:()=>({})});});
   act(()=>nav('a'));
   const first=pages[0]!;
   expect(first.id).toBe('a');
   act(()=>tree!.update(<>{screen('a')}{screen('b')}</>));
   act(()=>nav('a','b'));
   expect(pages).toHaveLength(2);
   act(()=>tree!.update(<>{screen('a')}</>));
   act(()=>nav('a'));
   expect(pages.at(-1)!.id).toBe(first.id);
 });
 it('adapter first cannot permanently bind fallback instead of a later wrapper',()=>{
   act(()=>nav('a'));
   act(()=>{tree=renderer.create(screen('a'),{createNodeMock:()=>({})});});
   const owned=pages.at(-1)!;
   act(()=>nav('a','settings'));
   act(()=>nav('a'));
   expect(pages.at(-1)!.id).toBe(owned.id);
 });
});
