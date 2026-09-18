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
  let nativeCalls: Array<{ pageId: string; name: string }>;

  beforeEach(() => {
    jest.resetModules();
    nativeCalls = [];
    NativeModules.RNAudienzzModule = {
      pageImpressionWithId: (pageId: string, name: string) =>
        nativeCalls.push({ pageId, name }),
    };
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    registry = require('../pageRegistry');
    Audienzz = require('../RNAudienzz').Audienzz;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('forwards the page to native as an id plus an analytics name', () => {
    Audienzz.pageImpression('Article');

    expect(nativeCalls).toHaveLength(1);
    expect(nativeCalls[0]!.name).toBe('Article');
    expect(nativeCalls[0]!.pageId).not.toBe('Article');
  });

  it('gives two visits to the same screen name distinct identities', () => {
    // The whole point of the id: a repeated name must not make the second report match the first
    // page's banners and recreate them instead of releasing them.
    Audienzz.pageImpression('Article');
    Audienzz.pageImpression('Article');

    expect(nativeCalls.map((c) => c.name)).toEqual(['Article', 'Article']);
    expect(nativeCalls[0]!.pageId).not.toBe(nativeCalls[1]!.pageId);
  });

  it('stamps the creation page synchronously', () => {
    // Ads rendered on the very next line must belong to this page.
    Audienzz.pageImpression('Article');

    expect(registry.getCurrentPage()?.name).toBe('Article');
    expect(registry.getCurrentPage()?.id).toBe(nativeCalls[0]!.pageId);
  });

  it('does not advance the epoch itself', () => {
    // Native echoes the impression back; counting it here as well double-counted the transition.
    Audienzz.pageImpression('Article');

    expect(registry.getPageEpoch()).toBe(0);
  });

  it('advances the epoch exactly once per impression, on the echo', () => {
    Audienzz.pageImpression('Article');
    // Native echoes the ROUTING key — the page id — because that is what banners match on.
    DeviceEventEmitter.emit(PAGE_IMPRESSION_EVENT, nativeCalls[0]!.pageId);

    expect(registry.getPageEpoch()).toBe(1);
  });

  it('notifies subscribers once for one explicit impression', () => {
    const seen: string[] = [];
    registry.subscribe((page) => seen.push(page));

    Audienzz.pageImpression('Article');
    DeviceEventEmitter.emit(PAGE_IMPRESSION_EVENT, nativeCalls[0]!.pageId);

    expect(seen).toEqual([nativeCalls[0]!.pageId]);
  });
});
