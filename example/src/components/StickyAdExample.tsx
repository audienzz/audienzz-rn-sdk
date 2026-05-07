import React, { useRef, useState, useCallback } from 'react';
import {
  Animated,
  Dimensions,
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
const REFRESH_MILLIS = 30_000;
const VISIBILITY_THRESHOLD = 0.2;

// Rows at which an ad slot is inserted (1-based paragraph index).
const AD_SLOT_ROWS = [6, 12, 18, 24, 30];

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
 * Each banner has smartRefresh enabled: the native layer pauses Prebid
 * auto-refresh when < 20 % of the ad is visible, and resumes (stale-aware)
 * when it comes back into view.  The green/red indicator mirrors the native
 * state using JS-side measureInWindow checks on every scroll event.
 */
export default function StickyAdExample() {
  const scrollY = useRef(new Animated.Value(0)).current;

  // One View ref per ad slot for visibility measurement.
  const bannerRefs = useRef<(View | null)[]>(
    Array(AD_SLOT_ROWS.length).fill(null),
  );
  const [loaded, setLoaded] = useState<boolean[]>(
    Array(AD_SLOT_ROWS.length).fill(false),
  );
  const [active, setActive] = useState<boolean[]>(
    Array(AD_SLOT_ROWS.length).fill(false),
  );

  // -------------------------------------------------------------------------
  // Visibility helpers
  // -------------------------------------------------------------------------

  const checkVisibility = useCallback(() => {
    const windowHeight = Dimensions.get('window').height;
    bannerRefs.current.forEach((ref, idx) => {
      if (!ref) return;
      ref.measureInWindow((_x, y, _w, height) => {
        if (height === 0) return;
        const visibleTop = Math.max(0, y);
        const visibleBottom = Math.min(windowHeight, y + height);
        const fraction = Math.max(0, visibleBottom - visibleTop) / height;
        const isActive = fraction >= VISIBILITY_THRESHOLD;
        setActive(prev => {
          if (prev[idx] === isActive) return prev;
          const next = [...prev];
          next[idx] = isActive;
          return next;
        });
      });
    });
  }, []);

  // -------------------------------------------------------------------------
  // Build row list
  // -------------------------------------------------------------------------

  const rows: React.JSX.Element[] = [];
  for (let i = 1; i <= 35; i += 1) {
    rows.push(<Paragraph key={`p-${i}`} index={i} />);

    const slotIdx = AD_SLOT_ROWS.indexOf(i);
    if (slotIdx !== -1) {
      rows.push(
        <AudienzzStickyAdWrapper
          key={`ad-${i}`}
          scrollY={scrollY}
          maxHeight={MAX_HEIGHT}
          stickyTopOffset={0}
        >
          <View
            ref={el => {
              bannerRefs.current[slotIdx] = el;
            }}
            collapsable={false}
            style={styles.bannerHost}
          >
            {/* Active / inactive indicator — shown once the ad has loaded */}
            {loaded[slotIdx] && (
              <View
                style={[
                  styles.indicator,
                  active[slotIdx]
                    ? styles.indicatorActive
                    : styles.indicatorInactive,
                ]}
              >
                <Text
                  style={[
                    styles.indicatorText,
                    active[slotIdx]
                      ? styles.indicatorTextActive
                      : styles.indicatorTextInactive,
                  ]}
                >
                  {active[slotIdx]
                    ? `● Ad ${slotIdx + 1} — Active (refreshing)`
                    : `○ Ad ${slotIdx + 1} — Inactive (paused)`}
                </Text>
              </View>
            )}

            <OriginalBanner
              adUnitId={AD_UNIT_ID}
              auConfigId={AU_CONFIG_ID}
              sizes={[AD_SIZE]}
              adFormats={['banner']}
              isLazyLoad={false}
              smartRefresh={true}
              refreshTimeMillis={REFRESH_MILLIS}
              onAdLoaded={() => {
                console.log(`[StickyAdExample] Ad ${i} loaded`);
                setLoaded(prev => {
                  const next = [...prev];
                  next[slotIdx] = true;
                  return next;
                });
                setTimeout(checkVisibility, 150);
              }}
              onAdFailedToLoad={error =>
                console.log(`[StickyAdExample] Ad ${i} failed:`, error)
              }
            />
          </View>
        </AudienzzStickyAdWrapper>,
      );
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <Animated.ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.contentContainer}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
          useNativeDriver: true,
          // listener runs on the JS thread alongside the native animation,
          // so we can measure visibility without giving up native-driver smoothness.
          listener: (_e: any) => checkVisibility(),
        },
      )}
      scrollEventThrottle={100}
    >
      {/* Header */}
      <Text style={styles.title}>Sticky Ad Example</Text>
      <Text style={styles.subtitle}>
        Scroll down — each banner stays pinned within its reserved area as you
        scroll past it, then exits at the bottom. Smart refresh pauses when
        {'<'} 20 % is visible and resumes stale-aware on return.
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
  indicator: {
    alignSelf: 'stretch',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 6,
  },
  indicatorActive: {
    backgroundColor: '#B9F6CA',
  },
  indicatorInactive: {
    backgroundColor: '#FFCDD2',
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  indicatorTextActive: {
    color: '#1B5E20',
  },
  indicatorTextInactive: {
    color: '#B71C1C',
  },
});
