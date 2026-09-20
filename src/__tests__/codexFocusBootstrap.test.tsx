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
 * Independent review probes, adopted as maintained regression tests.
 *
 * What they establish: a routed page must not report a visit, and its banner's native component
 * must not be created, until the navigation adapter has named that route as focused. The final
 * settled tree was already correct before the fix — these record every activation and every native
 * creation, including the intermediate ones, which is the only way the startup window is visible.
 *
 * They assert activation ids and native-component page keys, not merely that something is absent.
 * They do not measure completed native setup, live GAM/Prebid requests or impressions.
 */




describe('focus bootstrap and host lifecycle review',()=>{
 let pages:registry.AudienzzPageHandle[];
 let tree:renderer.ReactTestRenderer|undefined;
 beforeEach(()=>{
   registry.resetManagedPagesForTesting(); resetAudienzzNavigationTracking(); pages=[];
   jest.spyOn(Audienzz,'activatePage').mockImplementation(p=>{pages.push(p);registry.setCurrentPage(p);});
 });
 afterEach(()=>{if(tree)act(()=>tree!.unmount());tree=undefined;jest.restoreAllMocks();});
 const screen=(key:string)=><AudienzzPage key={key} name={key} route={{key}}><AudienzzBanner adConfigId="118" slotKey="one" lazyLoad={false}/></AudienzzPage>;
 const state=(key:string)=>({index:0,routes:[{key,name:key}]});
 const natives=()=>tree!.root.findAllByType('MockRemoteConfigBanner' as any);
 it('pre-mounted tabs do not start ad owners before the initial focused route is known',()=>{
   act(()=>{tree=renderer.create(<>{screen('a')}{screen('b')}</>,{createNodeMock:()=>({})});});
   // React Navigation supports mounting multiple tabs before NavigationContainer is ready.
   const beforeReady=natives().map(n=>n.props.pageKey);
   act(()=>audienzzOnNavigationReady({index:0,routes:[{key:'a',name:'a'},{key:'b',name:'b'}]}));
   expect(natives().map(n=>n.props.pageKey)).toEqual(['a']); // positive control: eventual focus repairs view state
   expect(beforeReady).not.toContain('b');
   expect(pages.map(p=>p.id)).toEqual(['a']);
 });
 it('ready reports only the initial visit with multiple pre-mounted pages',()=>{
   act(()=>{tree=renderer.create(<>{screen('a')}{screen('b')}</>,{createNodeMock:()=>({})});});
   act(()=>audienzzOnNavigationReady({index:0,routes:[{key:'a',name:'a'},{key:'b',name:'b'}]}));
   expect(pages.map(p=>p.id)).toEqual(['a']);
 });
 it('new navigator ready replaces focus after the old navigator unmounts',()=>{
   act(()=>audienzzOnNavigationReady(state('old')));
   act(()=>{tree=renderer.create(screen('old'),{createNodeMock:()=>({})});});
   expect(natives()).toHaveLength(1);
   act(()=>tree!.unmount());tree=undefined;
   act(()=>{tree=renderer.create(screen('new'),{createNodeMock:()=>({})});});
   expect(natives()).toHaveLength(0);
   act(()=>audienzzOnNavigationReady(state('new')));
   expect(natives().map(n=>n.props.pageKey)).toEqual(['new']);
   expect(registry.getCurrentPage()?.id).toBe('new');
 });
 it('focused page denied by host remains empty and resumes only when host permits',()=>{
   act(()=>audienzzOnNavigationReady(state('a')));
   const page=(active:boolean)=><AudienzzPage name="a" route={{key:'a'}} active={active}><AudienzzBanner adConfigId="118" slotKey="one"/></AudienzzPage>;
   act(()=>{tree=renderer.create(page(false),{createNodeMock:()=>({})});});
   expect(natives()).toHaveLength(0);
   act(()=>tree!.update(page(true)));
   expect(natives()).toHaveLength(1);
   act(()=>audienzzOnNavigationStateChange(state('b')));
   expect(natives()).toHaveLength(0);
   act(()=>audienzzOnNavigationStateChange(state('a')));
   expect(natives()).toHaveLength(1);
 });
 it('parent onReady in the same commit must not briefly mount an inactive banner',()=>{
   const created:string[]=[];
   function NavigationHarness(){
     React.useEffect(()=>audienzzOnNavigationReady({index:0,routes:[{key:'a',name:'a'},{key:'b',name:'b'}]}),[]);
     return <>{screen('a')}{screen('b')}</>;
   }
   act(()=>{tree=renderer.create(<NavigationHarness/>,{createNodeMock:({type,props})=>{
     if(type==='MockRemoteConfigBanner') created.push(props.pageKey);
     return {};
   }});});
   expect(natives().map(n=>n.props.pageKey)).toEqual(['a']);
   expect(created).not.toContain('b');
 });

});
