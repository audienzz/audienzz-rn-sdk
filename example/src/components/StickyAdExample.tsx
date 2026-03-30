import React, { useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { OriginalBanner } from 'audienzz';
import { AudienzzStickyAdWrapper } from '../../../src/components/AudienzzStickyAdWrapper';

// Ad configuration — mirrors the iOS StickyAdExampleViewController constants.
const AD_UNIT_ID = '/96628199/testapp_publisher/banner_test_ad_unit';
const AU_CONFIG_ID = '15624474';
const AD_SIZE = { width: 300, height: 250 };
const MAX_HEIGHT = 450;

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod ' +
  'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim ' +
  'veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea ' +
  'commodo consequat. Duis aute irure dolor in reprehenderit in voluptate ' +
  'velit esse cillum dolore eu fugiat nulla pariatur.';

/** Renders a single content paragraph card. */
function Paragraph({ index }: { index: number }) {
  return (
    <View style={styles.paragraph}>
      <Text style={styles.paragraphTitle}>Paragraph {index}</Text>
      <Text style={styles.paragraphBody}>{LOREM}</Text>
    </View>
  );
}

/**
 * Demonstrates `AudienzzStickyAdWrapper` in a static `ScrollView`.
 *
 * Mirrors the iOS `StickyAdExampleViewController`:
 *   - 5 content paragraphs before the ad
 *   - A 300×250 banner wrapped in `AudienzzStickyAdWrapper` (maxHeight 450)
 *   - 9 content paragraphs after the ad
 *
 * Scroll down — the banner stays pinned within its 450 pt reserved area as
 * you scroll past it, then exits at the bottom exactly like the iOS wrapper.
 */
export default function StickyAdExample() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const adSlots = new Set([6, 12, 18, 24, 30]);
  const rows: React.JSX.Element[] = [];

  for (let i = 1; i <= 35; i += 1) {
    rows.push(<Paragraph key={`p-${i}`} index={i} />);

    if (adSlots.has(i)) {
      rows.push(
        <AudienzzStickyAdWrapper
          key={`ad-${i}`}
          scrollY={scrollY}
          maxHeight={MAX_HEIGHT}
          stickyTopOffset={0}
        >
          <View style={styles.bannerHost}>
            <OriginalBanner
              adUnitId={AD_UNIT_ID}
              auConfigId={AU_CONFIG_ID}
              sizes={[AD_SIZE]}
              adFormats={['banner']}
              isLazyLoad={false}
              onAdLoaded={() => console.log(`[StickyAdExample] Ad ${i} loaded`)}
              onAdFailedToLoad={(error) =>
                console.log(`[StickyAdExample] Ad ${i} failed:`, error)
              }
            />
          </View>
        </AudienzzStickyAdWrapper>
      );
    }
  }

  return (
    <Animated.ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.contentContainer}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true },
      )}
      scrollEventThrottle={16}
    >
      {/* Header */}
      <Text style={styles.title}>Sticky Ad Example</Text>
      <Text style={styles.subtitle}>
        Scroll down — each banner stays pinned within its reserved area as you
        scroll past it, then exits at the bottom.
      </Text>

      {rows}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    ...Platform.select({ android: { paddingBottom: 48 } }),
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
    lineHeight: 20,
  },
  paragraph: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  paragraphTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 6,
  },
  paragraphBody: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
  },
  bannerHost: {
    alignItems: 'center',
  },
});
