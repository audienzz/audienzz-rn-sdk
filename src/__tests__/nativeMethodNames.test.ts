import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * The bridge is only as good as its spelling.
 *
 * `RCT_EXPORT_METHOD(setGdprConsentString:...)` exports the JavaScript name
 * `setGdprConsentString`. The JS layer called `setGDPRConsentString`, so a publisher's TCF consent
 * string never reached the SDK — and nothing failed at build time, because the native module is a
 * cast on the TypeScript side. A sweep found the same mistake on `setStoreUrl`/`getStoreUrl`.
 *
 * This asserts every native method JS calls actually exists on both platforms, so the next one is
 * caught here rather than by a publisher.
 */

const root = join(__dirname, '..', '..');

function read(dir: string, match: RegExp): string {
  let out = '';
  const walk = (d: string) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (match.test(entry.name)) out += readFileSync(full, 'utf8');
    }
  };
  walk(dir);
  return out;
}

const collect = (source: string, pattern: RegExp): Set<string> => {
  const found = new Set<string>();
  for (const m of source.matchAll(pattern)) found.add(m[1]!);
  return found;
};

const jsSource = read(join(root, 'src'), /\.tsx?$/);
const iosSource = read(join(root, 'ios'), /\.m$/);
const androidSource = read(join(root, 'android', 'src'), /\.kt$/);

const called = collect(jsSource, /NativeModulesCombined\.\w+\.(\w+)\s*\(/g);
const iosExports = collect(iosSource, /RCT_EXPORT_METHOD\(\s*(\w+)/g);
const androidExports = collect(
  androidSource,
  /@ReactMethod[^\n]*\n\s*(?:@\w+[^\n]*\n\s*)*fun\s+(\w+)/g
);

/**
 * Targeting APIs that genuinely exist on one platform only, because the underlying SDK API does.
 * Everything here throws if called on the other platform — a real gap, tracked separately, but not
 * a spelling mistake. Adding a name here must mean "this SDK has no such concept", never "the
 * spellings differ".
 */
const iosOnly = new Set([
  'setLocation', 'getLocation', 'setItunesID', 'getItunesID',
  'setSourceapp', 'getSourceapp', 'setContentUrl', 'getContentUrl',
  'setUserExt', 'getUserExt', 'addUserData', 'updateUserData',
  'addAppKeyword', 'addAppKeywords', 'removeAppKeyword', 'clearAppKeywords', 'getAppKeywords',
]);
const androidOnly = new Set([
  'setUserLatLng', 'getUserLatLng', 'clearUserLatLng',
  'setBundleName', 'getBundleName',
  'addExtData', 'updateExtData', 'removeExtData', 'clearExtData', 'getExtDataDictionary',
  'getKeywordSet',
]);

describe('native module method names', () => {
  it('finds the bridge sources', () => {
    expect(called.size).toBeGreaterThan(20);
    expect(iosExports.size).toBeGreaterThan(20);
    expect(androidExports.size).toBeGreaterThan(20);
  });

  it('every method JS calls is exported by iOS', () => {
    const missing = [...called].filter(
      (name) => !iosExports.has(name) && !androidOnly.has(name)
    );
    expect(missing).toEqual([]);
  });

  it('every method JS calls is exported by Android', () => {
    const missing = [...called].filter(
      (name) => !androidExports.has(name) && !iosOnly.has(name)
    );
    expect(missing).toEqual([]);
  });

  it('no platform-only allowance is really a spelling difference', () => {
    // If the other platform exports the same name in different case, it is not platform-specific.
    const lower = (s: Set<string>) => new Set([...s].map((n) => n.toLowerCase()));
    const iosLower = lower(iosExports);
    const androidLower = lower(androidExports);
    const miscased = [
      ...[...androidOnly].filter((n) => iosLower.has(n.toLowerCase())),
      ...[...iosOnly].filter((n) => androidLower.has(n.toLowerCase())),
    ];
    expect(miscased).toEqual([]);
  });
});

/**
 * Objective-C call sites into the Swift SDK must use the selector Swift actually generates.
 *
 * `@objc func destroy(reason:)` is exported as `destroyWithReason:` — the argument label is folded
 * into the selector — so `[owner destroy:reason]` compiles against nothing and is an unrecognized
 * selector at runtime. This is the same failure mode as the GDPR method-name casing bug: the
 * bridge and the SDK disagree about a name, and no type checker sees it.
 */
describe('Objective-C selectors into the Swift SDK', () => {
  const source = readFileSync(
    join(__dirname, '..', '..', 'ios', 'RCTRemoteConfigInterstitialView.m'),
    'utf8'
  );

  it('releases the interstitial owner with the generated selector', () => {
    expect(source).toContain('destroyWithReason:');
    expect(source).not.toMatch(/\[\s*owner\s+destroy\s*:/);
  });
});
