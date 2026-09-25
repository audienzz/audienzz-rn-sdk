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

describe('independent managed navigation review',()=>{
 let pages:registry.AudienzzPageHandle[];
 beforeEach(()=>{
   registry.resetManagedPagesForTesting(); resetAudienzzNavigationTracking();
   pages=[];
   jest.spyOn(Audienzz,'activatePage').mockImplementation(p=>{pages.push(p); registry.setCurrentPage(p);});
 });
 afterEach(()=>jest.restoreAllMocks());
 // React Navigation hands every screen its `route`; passing it is what binds a wrapper to that
 // route instance. Guessing the binding from callback order was the defect the September 19
 // review reproduced, so these fixtures now supply it. No assertion changes.
 const screen=(key:string,name='article')=><AudienzzPage key={key} name={name} route={{key}}><AudienzzBanner adConfigId="118" slotKey="one"/></AudienzzPage>;
 const nav=(...keys:string[])=>audienzzOnNavigationStateChange({index:keys.length-1,routes:keys.map(key=>({key,name:'article'}))});
 it('REVIEW popping a same-name route returns to the retained wrapper identity',()=>{
   let tree!:renderer.ReactTestRenderer;
   act(()=>{tree=renderer.create(<>{screen('a')}</>,{createNodeMock:()=>({})});});
   act(()=>nav('a'));
   const first=pages[0]!;
   act(()=>tree.update(<>{screen('a')}{screen('b')}</>));
   act(()=>nav('a','b'));
   expect(pages).toHaveLength(2);
   expect(pages[1]!.id).not.toBe(first.id);
   act(()=>tree.update(<>{screen('a')}</>));
   act(()=>nav('a'));
   expect(pages.at(-1)!.id).toBe(first.id);
   act(()=>tree.unmount());
 });
 it('REVIEW analytics name may differ from the router screen name',()=>{
   let tree!:renderer.ReactTestRenderer;
   act(()=>{tree=renderer.create(screen('a','article-detail'),{createNodeMock:()=>({})});});
   // Dormant until the adapter names the route: a routed wrapper does not decide its own focus.
   expect(pages).toHaveLength(0);
   act(()=>nav('a'));
   // One visit, carrying the WRAPPER's analytics name rather than the router's screen name and
   // rather than a second identity minted for the same route.
   expect(pages).toEqual([{id:'a',name:'article-detail'}]);
   act(()=>tree.unmount());
 });
});
