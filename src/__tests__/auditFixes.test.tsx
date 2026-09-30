import fs from 'fs';
import path from 'path';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { OriginalBanner } from '../ads/original/OriginalBanner';
import { OriginalInterstitial } from '../ads/original/OriginalInterstitial';
import { OriginalRewarded } from '../ads/original/OriginalRewarded';

jest.mock('react-native', () => ({
  Platform: { select: (o: any) => o.default },
  requireNativeComponent: (name: string) => name,
  findNodeHandle: jest.fn(() => 42),
  StyleSheet: {
    create: (s: any) => s,
    flatten: (s: any) => (Array.isArray(s) ? Object.assign({}, ...s.filter(Boolean)) : s ?? {}),
  },
  View: 'View',
  DeviceEventEmitter: { addListener: jest.fn(), emit: jest.fn() },
  NativeModules: {},
  UIManager: {
    getViewManagerConfig: jest.fn(() => ({ Commands: {} })),
    dispatchViewManagerCommand: jest.fn(),
  },
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * The fixes from the August audit (PR #39), ported onto the page-impression API, plus the iOS
 * banner request fix found while reconciling them.
 */

function render(element: React.ReactElement) {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(element, { createNodeMock: () => ({}) });
  });
  return tree;
}

const native = (tree: renderer.ReactTestRenderer, type: string) =>
  tree.root.findByType(type as any).props as Record<string, any>;

const root = path.join(__dirname, '..', '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('OriginalBanner', () => {
  const sizes = [{ width: 300, height: 250 }, { width: 320, height: 50 }];

  it('a lazy banner reserves its first size, so the viewport check has a frame', () => {
    // A 0x0 slot never becomes visible, so a lazy banner that hid until onAdLoaded never loaded.
    const tree = render(<OriginalBanner adUnitId="/1/b" auConfigId="p" sizes={sizes} isLazyLoad />);
    const container = tree.root.findAllByType('View' as any)[0]!;
    expect(container.props.style).toEqual([{ width: 300, height: 250 }]);
  });

  it('a non-lazy, non-reserved banner stays hidden until it loads', () => {
    const tree = render(<OriginalBanner adUnitId="/1/b" auConfigId="p" sizes={sizes} />);
    const container = tree.root.findAllByType('View' as any)[0]!;
    expect(container.props.style).toEqual([{ width: 0, height: 0, overflow: 'hidden' }]);
  });

  it('forwards playbackMethod, which was destructured and then dropped', () => {
    const tree = render(
      <OriginalBanner adUnitId="/1/b" auConfigId="p" sizes={sizes} playbackMethod={['ClickToPlay']} />
    );
    expect(native(tree, 'RCTOriginalBannerView').playbackMethod).toEqual(['ClickToPlay']);
  });

  it('click, open and close callbacks take no argument', () => {
    const clicked = jest.fn();
    const opened = jest.fn();
    const closed = jest.fn();
    const tree = render(
      <OriginalBanner adUnitId="/1/b" auConfigId="p" sizes={sizes}
        onAdClicked={clicked} onAdOpened={opened} onAdClosed={closed} />
    );
    const props = native(tree, 'RCTOriginalBannerView');
    act(() => {
      props.onAdClicked({ nativeEvent: {} });
      props.onAdOpened({ nativeEvent: {} });
      props.onAdClosed({ nativeEvent: {} });
    });
    expect(clicked).toHaveBeenCalledWith();
    expect(opened).toHaveBeenCalledWith();
    expect(closed).toHaveBeenCalledWith();
  });

  it('does not log every load', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const tree = render(<OriginalBanner adUnitId="/1/b" auConfigId="p" sizes={sizes} />);
    act(() => native(tree, 'RCTOriginalBannerView').onAdLoaded({ nativeEvent: { width: 300, height: 250 } }));
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });
});

describe.each([
  ['OriginalInterstitial', OriginalInterstitial, 'RCTOriginalInterstitialView'],
  ['OriginalRewarded', OriginalRewarded, 'RCTOriginalRewardedView'],
] as const)('%s', (_name, Component, nativeName) => {
  it('surfaces a failed presentation as onAdFailedToShow', () => {
    const failed = jest.fn();
    const tree = render(<Component adUnitId="/1/i" auConfigId="p" onAdFailedToShow={failed} />);
    act(() => native(tree, nativeName).onAdFailedToShow({ nativeEvent: { code: 3, message: 'no activity' } }));
    expect(failed).toHaveBeenCalledWith({ code: 3, message: 'no activity' });
  });

  it('has no dead show() handle: it presents on load', () => {
    // The ref handle dispatched a command neither view manager implements, so it did nothing.
    expect(typeof Component).toBe('function');
    expect((Component as any).$$typeof).toBeUndefined(); // not a forwardRef
  });
});

describe('native bridge fixes', () => {
  it('iOS OriginalBanner loads the request the SDK hands over, weakly', () => {
    const view = read('ios/RCTOriginalBannerView.m');
    // The SDK builds a fresh request per auction (bid keys, global targeting, its own keys) and
    // leaves the one created here untouched; loading `request` sent Google none of them.
    expect(view).toContain('[strongSelf.bannerView loadRequest:gamRequest];');
    expect(view).not.toMatch(/bannerView loadRequest:request\]/);
    expect(view).toContain('__weak typeof(self) weakSelf = self;');
    expect(view.indexOf('_auBannerView.onLoadRequest = onLoadRequest;'))
      .toBeLessThan(view.indexOf('[_auBannerView createAdWith:request'));
  });

  it('iOS banner tears the previous ad down before building another', () => {
    const view = read('ios/RCTOriginalBannerView.m');
    expect(view).toMatch(/- \(void\)internalCreateAd \{\s*\[super internalCreateAd\];\s*\[self teardownAd\];/);
    expect(view).toContain('[_auBannerView destroy];');
  });

  it.each(['ios/RCTOriginalInterstitialViewManager.m', 'ios/RCTOriginalRewardedViewManager.m'])(
    '%s exports onAdFailedToShow', (file) => {
      expect(read(file)).toContain('RCT_EXPORT_VIEW_PROPERTY(onAdFailedToShow, RCTBubblingEventBlock)');
    });

  it.each([
    'android/src/main/java/com/audienzzrn/RCTOriginalInterstitialViewManager.kt',
    'android/src/main/java/com/audienzzrn/RCTOriginalRewardedViewManager.kt',
  ])('%s registers onAdFailedToShow', (file) => {
    expect(read(file)).toContain('"onAdFailedToShow" to eventMap("onAdFailedToShow")');
  });

  it('Android initialize() rejects on failure instead of hanging', () => {
    const module = read('android/src/main/java/com/audienzzrn/RNAudienzzModule.kt');
    expect(module).toMatch(/else -> \{[\s\S]*?promise\.reject\(\s*"INIT_FAILED"/);
  });

  it('Android original fullscreen ads never force-unwrap the Activity', () => {
    for (const file of ['RCTOriginalInterstitialView.kt', 'RCTOriginalRewardedView.kt']) {
      expect(read(`android/src/main/java/com/audienzzrn/${file}`)).not.toContain('activity!!');
    }
  });

  it('a rewarded ad dismissed without a reward does not crash', () => {
    expect(read('android/src/main/java/com/audienzzrn/RCTOriginalRewardedView.kt'))
      .not.toContain('lateinit var reward');
    expect(read('ios/RCTOriginalRewardedView.m')).toContain('self.reward.amount ?: @0');
  });

  it('the iOS interstitial sizes workaround merges into the publisher impOrtbConfig', () => {
    const view = read('ios/RCTOriginalInterstitialView.m');
    expect(view).toContain('[self mergeBannerFormatIntoOrtbConfig:self.impOrtbConfig sizes:_sizes]');
    expect(view).not.toContain('createInterstitialORTBConfigWithSizes');
  });

  it('no deprecated status-bar calls remain', () => {
    expect(read('ios/RCTOriginalInterstitialView.m')).not.toContain('setStatusBarHidden');
  });
});
