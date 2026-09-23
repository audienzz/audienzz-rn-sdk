import fs from 'fs';
import path from 'path';

/**
 * An interstitial's formats and API frameworks are backend-controlled on every platform: the ad
 * config's `prebidConfig.format` / `prebidConfig.apis`, else banner + video with MRAID 1/2/3 +
 * OMID 1. So no interstitial exposes them as a prop — neither in the JS types nor in either native
 * view manager, where a leftover declaration would quietly keep the override alive.
 */

const root = path.join(__dirname, '..', '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

const iosProps = (file: string) =>
  new Set([...read(file).matchAll(/RCT_EXPORT_VIEW_PROPERTY\(\s*(\w+)\s*,/g)].map((m) => m[1]!));
const androidProps = (file: string) =>
  new Set([...read(file).matchAll(/@ReactProp\(\s*name\s*=\s*"([^"]+)"/g)].map((m) => m[1]!));

const interstitials = [
  {
    name: 'OriginalInterstitial',
    ios: 'ios/RCTOriginalInterstitialViewManager.m',
    android: 'android/src/main/java/com/audienzzrn/RCTOriginalInterstitialViewManager.kt',
    component: 'src/ads/original/OriginalInterstitial.tsx',
  },
  {
    name: 'RemoteConfigInterstitial',
    ios: 'ios/RCTRemoteConfigInterstitialViewManager.m',
    android: 'android/src/main/java/com/audienzzrn/RCTRemoteConfigInterstitialManager.kt',
    component: 'src/ads/original/RemoteConfigInterstitial.tsx',
  },
];

describe.each(interstitials)('$name', ({ ios, android, component }) => {
  it.each(['adFormats', 'apiParameters'])('"%s" is not a native prop on either platform', (prop) => {
    expect(iosProps(ios).has(prop)).toBe(false);
    expect(androidProps(android).has(prop)).toBe(false);
  });

  it('never sends a format or API list to native', () => {
    expect(read(component)).not.toMatch(/adFormats|apiParameters/);
  });

  it('control: the managers are really being read', () => {
    expect(iosProps(ios).size).toBeGreaterThan(0);
    expect(androidProps(android).size).toBeGreaterThan(0);
  });
});

it('the interstitial prop types have no format or API list', () => {
  const types = read('src/types/Original.ts');
  const decl = types.match(/export interface OriginalInterstitialProps[\s\S]*?\{/)?.[0] ?? '';
  expect(decl).toContain("'adFormats'");
  expect(decl).toContain("'apiParameters'");
  expect(decl).toMatch(/Omit<Parameters,[^>]*'adFormats'[^>]*'apiParameters'/);
});
