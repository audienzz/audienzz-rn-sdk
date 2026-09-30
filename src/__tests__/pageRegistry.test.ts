import { DeviceEventEmitter } from 'react-native';

/**
 * Page ownership on React Native is split deliberately: `setCurrentPage` is the stamp new ads are
 * created with and must be applied synchronously, while the epoch and listener notifications are
 * driven by the native `AudienzzPageImpression` event.
 *
 * Getting that split wrong shipped twice: removing the synchronous stamp made the documented
 * ordering ("report the page, then render its ads") capture the PREVIOUS page into an immutable
 * pageKey, and having JS notify as well as native double-counted every transition.
 */
describe('pageRegistry', () => {
  let registry: typeof import('../pageRegistry');

  const PAGE_IMPRESSION_EVENT = 'AudienzzPageImpression';

  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    registry = require('../pageRegistry');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('has no page before one is reported', () => {
    expect(registry.getCurrentPage()).toBeNull();
  });

  it('warns when an ad is created before any page impression', () => {
    // Native attach-time adoption cannot repair a bridge ad -- with no page key its host resolves
    // to the single host Activity, which can never equal a route key -- so this has to be loud.
    registry.getCurrentPage();

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('before any pageImpression')
    );
  });

  it('stamps the creation page synchronously', () => {
    registry.setCurrentPage(registry.createPage('Article'));

    expect(registry.getCurrentPage()?.name).toBe('Article');
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('does not advance the epoch when only the stamp is set', () => {
    // The stamp is JS-owned and immediate; the epoch belongs to native.
    registry.setCurrentPage(registry.createPage('Article'));

    expect(registry.getPageEpoch()).toBe(0);
  });

  it('advances the epoch on the native event', () => {
    DeviceEventEmitter.emit(PAGE_IMPRESSION_EVENT, 'Article');

    expect(registry.getPageEpoch()).toBe(1);
  });

  it('advances the epoch for an impression JS never made', () => {
    // The automatic foreground impression is fired natively and never passes through the JS API.
    // Before native owned foreground reporting, rendering banners missed it entirely.
    DeviceEventEmitter.emit(PAGE_IMPRESSION_EVENT, 'Home');

    expect(registry.getPageEpoch()).toBe(1);
  });

  it('notifies subscribers with the page and epoch', () => {
    const seen: Array<[string, number]> = [];
    registry.subscribe((page, epoch) => seen.push([page, epoch]));

    DeviceEventEmitter.emit(PAGE_IMPRESSION_EVENT, 'Article');
    DeviceEventEmitter.emit(PAGE_IMPRESSION_EVENT, 'Home');

    expect(seen).toEqual([
      ['Article', 1],
      ['Home', 2],
    ]);
  });

  it('stops notifying an unsubscribed listener', () => {
    const seen: string[] = [];
    const listener = (page: string) => seen.push(page);
    registry.subscribe(listener);
    registry.unsubscribe(listener);

    DeviceEventEmitter.emit(PAGE_IMPRESSION_EVENT, 'Article');

    expect(seen).toEqual([]);
  });

  it('ignores a malformed native event', () => {
    DeviceEventEmitter.emit(PAGE_IMPRESSION_EVENT, '');
    DeviceEventEmitter.emit(PAGE_IMPRESSION_EVENT, undefined);

    expect(registry.getPageEpoch()).toBe(0);
  });
});
