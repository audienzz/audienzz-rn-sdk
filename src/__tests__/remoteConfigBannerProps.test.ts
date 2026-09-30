import fs from 'fs';
import path from 'path';

/**
 * Every prop the JS component sends has to be declared by BOTH native view managers.
 *
 * A prop the native side never declares is silently dropped — React Native does not warn, the
 * TypeScript types do not catch it (the native component is `requireNativeComponent`, which is a
 * cast), and the feature simply does nothing on that platform. That is the same failure mode as
 * the GDPR method-name casing bug, one layer down.
 */

const root = path.join(__dirname, '..', '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

const iosManager = read('ios/RCTRemoteConfigBannerViewManager.m');
const androidManager = read('android/src/main/java/com/audienzzrn/RCTRemoteConfigBannerViewManager.kt');
const component = read('src/ads/original/RemoteConfigBanner.tsx');
const types = read('src/types/RemoteConfig.ts');

/** `RCT_EXPORT_VIEW_PROPERTY(name, Type)` */
const iosProps = new Set(
  [...iosManager.matchAll(/RCT_EXPORT_VIEW_PROPERTY\(\s*(\w+)\s*,/g)].map((m) => m[1]!)
);
/** `@ReactProp(name = "foo")` */
const androidProps = new Set(
  [...androidManager.matchAll(/@ReactProp\(\s*name\s*=\s*"([^"]+)"/g)].map((m) => m[1]!)
);

/** Props declared on the public interface, minus callbacks and style. */
const declaredProps = (() => {
  const body = types.match(
    /export interface RemoteConfigBannerProps extends AdEvents \{([\s\S]*?)\n\}/
  )?.[1];
  if (!body) throw new Error('RemoteConfigBannerProps not found');
  return [...body.matchAll(/^\s{2}(\w+)\??:/gm)]
    .map((m) => m[1]!)
    .filter((name) => name !== 'style' && !name.startsWith('on'));
})();

describe('RemoteConfigBanner native props', () => {
  it('declares the props this test knows the component relies on', () => {
    expect(declaredProps).toEqual(expect.arrayContaining(['adConfigId', 'pageKey']));
  });

  it.each(['adConfigId', 'pageKey'])(
    '"%s" is exported by the iOS view manager',
    (prop) => {
      expect(iosProps.has(prop)).toBe(true);
    }
  );

  it.each(['adConfigId', 'pageKey'])(
    '"%s" is exported by the Android view manager',
    (prop) => {
      expect(androidProps.has(prop)).toBe(true);
    }
  );

  // Backend-driven only: the ad config's `lazyLoad` / `prefetchDistanceDp` decide, on every
  // platform. A prop here would let one app override a placement the backend tunes for all.
  it.each(['lazyLoad', 'prefetchMargin'])(
    '"%s" is not an app-side setting on either platform',
    (prop) => {
      expect(declaredProps).not.toContain(prop);
      expect(iosProps.has(prop)).toBe(false);
      expect(androidProps.has(prop)).toBe(false);
    }
  );

  it('sends every publicly declared prop to the native component', () => {
    // The component spreads `otherProps`, so anything on the interface reaches native — the risk
    // is the native side not declaring it, which the assertions above cover for both platforms.
    expect(component).toContain('...otherProps');
    for (const prop of declaredProps) {
      expect(iosProps.has(prop) && androidProps.has(prop)).toBe(true);
    }
  });
});
