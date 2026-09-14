import { DeviceEventEmitter, NativeModules } from 'react-native';

/**
 * `Audienzz.pageImpression` has exactly two jobs: stamp the creation page synchronously, and tell
 * native. It must NOT notify the JS registry itself — native echoes every impression back, and
 * having both owners notify double-counted each transition. Conversely, dropping the synchronous
 * stamp made the documented ordering ("report the page, then render its ads") capture the previous
 * page into an immutable pageKey.
 */
describe('Audienzz.pageImpression', () => {
  const PAGE_IMPRESSION_EVENT = 'AudienzzPageImpression';

  let registry: typeof import('../pageRegistry');
  let Audienzz: typeof import('../RNAudienzz').Audienzz;
  let nativeCalls: string[];

  beforeEach(() => {
    jest.resetModules();
    nativeCalls = [];
    NativeModules.RNAudienzzModule = {
      pageImpression: (name: string) => nativeCalls.push(name),
    };
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    registry = require('../pageRegistry');
    Audienzz = require('../RNAudienzz').Audienzz;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('forwards the page to native', () => {
    Audienzz.pageImpression('Article');

    expect(nativeCalls).toEqual(['Article']);
  });

  it('stamps the creation page synchronously', () => {
    // Ads rendered on the very next line must belong to this page.
    Audienzz.pageImpression('Article');

    expect(registry.getCurrentPage()).toBe('Article');
  });

  it('does not advance the epoch itself', () => {
    // Native echoes the impression back; counting it here as well double-counted the transition.
    Audienzz.pageImpression('Article');

    expect(registry.getPageEpoch()).toBe(0);
  });

  it('advances the epoch exactly once per impression, on the echo', () => {
    Audienzz.pageImpression('Article');
    DeviceEventEmitter.emit(PAGE_IMPRESSION_EVENT, 'Article');

    expect(registry.getPageEpoch()).toBe(1);
  });

  it('notifies subscribers once for one explicit impression', () => {
    const seen: string[] = [];
    registry.subscribe((page) => seen.push(page));

    Audienzz.pageImpression('Article');
    DeviceEventEmitter.emit(PAGE_IMPRESSION_EVENT, 'Article');

    expect(seen).toEqual(['Article']);
  });
});
