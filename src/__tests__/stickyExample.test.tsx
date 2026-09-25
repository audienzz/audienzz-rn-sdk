import React from 'react';
import renderer, { act } from 'react-test-renderer';
import StickyAdExample from '../../example/src/components/StickyAdExample';

jest.mock('audienzz', () => ({ OriginalBanner: 'Banner' }), { virtual: true });
jest.mock('../../src/components/AudienzzStickyAdWrapper', () => ({
  AudienzzStickyAdWrapper: 'Sticky',
}));
jest.mock('react-native', () => ({
  Platform: { select: () => ({}) },
  PixelRatio: { get: () => 3 },
  StyleSheet: { create: (styles: any) => styles },
  Text: 'Text', View: 'View',
  Animated: { Value: class {}, ScrollView: 'Scroll', event: () => jest.fn() },
}));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

test('every sticky banner is lazy and shows indicators on both sides after loading', () => {
  jest.useFakeTimers();
  let tree!: renderer.ReactTestRenderer;
  act(() => { tree = renderer.create(<StickyAdExample />); });
  const banners = tree.root.findAllByType('Banner' as any);
  expect(banners).toHaveLength(5);
  for (const banner of banners) {
    expect(banner.props.isLazyLoad).toBe(true);
    expect(banner.props.smartRefresh).toBe(true);
  }
  act(() => { banners[0]!.props.onAdLoaded(); });
  const indicators = tree.root.findAllByType('Text' as any).filter(
    (node) => String(node.props.children).startsWith('Ad 1 — viewport')
  );
  expect(indicators).toHaveLength(2);
  act(() => { tree.unmount(); jest.runOnlyPendingTimers(); });
  jest.useRealTimers();
});

test('both indicators follow the measured half-height and physical-pixel top boundaries', () => {
  jest.useFakeTimers();
  let tree!: renderer.ReactTestRenderer;
  let bannerY = 575; // viewport [100,700], exactly half of a 250-point banner visible
  act(() => { tree = renderer.create(<StickyAdExample />, {
    createNodeMock: ({ props }) => ({ measureInWindow: (callback: (...args: number[]) => void) => {
      if (props.testID === 'sticky-viewport') callback(0, 100, 400, 600);
      else callback(0, bannerY, 300, 250);
    } }),
  }); });
  act(() => { tree.root.findAllByType('Banner' as any)[0]!.props.onAdLoaded(); });
  const expectVerdict = (y: number, verdict: string) => {
    bannerY = y;
    act(() => { jest.advanceTimersByTime(500); });
    const labels = tree.root.findAllByType('Text' as any).filter(
      node => String(node.props.children).startsWith('Ad 1 — viewport')
    );
    expect(labels).toHaveLength(2);
    labels.forEach(label => expect(label.props.children).toBe(`Ad 1 — viewport ${verdict} (estimate)`));
  };
  expectVerdict(575, 'eligible');
  expectVerdict(576, 'outside');
  expectVerdict(99.5, 'outside'); // 1.5 physical pixels above the viewport
  expectVerdict(100, 'eligible');
  expectVerdict(701, 'outside');
  act(() => { tree.unmount(); jest.runOnlyPendingTimers(); });
  jest.useRealTimers();
});
