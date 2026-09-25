import React from 'react';
import renderer, { act } from 'react-test-renderer';
import StickyAdExample from '../../example/src/components/StickyAdExample';

jest.mock('audienzz', () => ({ OriginalBanner: 'Banner' }), { virtual: true });
jest.mock('../../src/components/AudienzzStickyAdWrapper', () => ({
  AudienzzStickyAdWrapper: 'Sticky',
}));
jest.mock('react-native', () => ({
  Platform: { select: () => ({}) },
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
