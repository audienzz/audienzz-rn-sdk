import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AudienzzPage } from '../managed/AudienzzPage';
import {
  AudienzzBanner,
} from '../managed/AudienzzBanner';
import { Audienzz } from '../RNAudienzz';
import * as registry from '../pageRegistry';
import {audienzzOnNavigationReady,audienzzOnNavigationStateChange,resetAudienzzNavigationTracking} from '../managed/navigation';

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



describe('explicit route focus review',()=>{
 let pages:registry.AudienzzPageHandle[];
 let tree:renderer.ReactTestRenderer|undefined;
 beforeEach(()=>{
   registry.resetManagedPagesForTesting();resetAudienzzNavigationTracking();pages=[];
   jest.spyOn(Audienzz,'activatePage').mockImplementation(p=>{pages.push(p);registry.setCurrentPage(p);});
 });
 afterEach(()=>{if(tree)act(()=>tree!.unmount());tree=undefined;jest.restoreAllMocks();});
 const screen=(key:string)=><AudienzzPage name="Article" route={{key}}><AudienzzBanner adConfigId="118" slotKey="one" /></AudienzzPage>;
 const state=(...keys:string[])=>({index:keys.length-1,routes:keys.map(key=>({key,name:key==='settings'?'Settings':'Article'}))});
 it('late content on a retained outgoing route cannot reactivate it',()=>{
   act(()=>audienzzOnNavigationReady(state('a')));
   act(()=>{tree=renderer.create(<React.Fragment />,{createNodeMock:()=>({})});});
   act(()=>audienzzOnNavigationStateChange(state('a','settings')));
   const destination=pages.at(-1)!;
   expect(destination.id).toBe('settings');expect(pages).toHaveLength(2);
   // A's data resolves after Settings is already current; A remains retained in the stack.
   act(()=>tree!.update(screen('a')));
   expect(registry.getCurrentPage()).toEqual(destination);
   expect(pages).toHaveLength(2);
 });
 it('one initial navigation remains one impression when wrapper content mounts later',()=>{
   act(()=>audienzzOnNavigationReady(state('a')));
   expect(pages).toHaveLength(1);
   act(()=>{tree=renderer.create(screen('a'),{createNodeMock:()=>({})});});
   expect(pages).toHaveLength(1);
 });
 it('control initial wrapper then ready deduplicates and restores ownership on return',()=>{
   act(()=>{tree=renderer.create(screen('a'),{createNodeMock:()=>({})});});
   const first=pages[0]!;
   act(()=>audienzzOnNavigationReady(state('a')));
   expect(pages).toHaveLength(1);
   act(()=>audienzzOnNavigationStateChange(state('a','settings')));
   expect(pages.at(-1)!.id).toBe('settings');
   act(()=>audienzzOnNavigationStateChange(state('a')));
   expect(pages.at(-1)).toEqual(first);
   expect(pages).toHaveLength(3);
 });
});
