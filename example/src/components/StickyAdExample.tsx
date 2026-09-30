import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Animated, PixelRatio, Platform, StyleSheet, Text, View } from 'react-native';
import { RemoteConfigBanner } from 'audienzz';
import { AudienzzStickyAdWrapper } from '../../../src/components/AudienzzStickyAdWrapper';
import { REMOTE_CONFIG } from '../remoteConfig';

// Reserve layout before loading; delivery settings come from the remote placement.
const AD_SIZE = { width: 300, height: 250 };
const MAX_HEIGHT = 450;

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
 * Remote config controls lazy loading and prefetch distance. Native owns refresh.
 * These indicators estimate geometry only; lifecycle, covers and publisher
 * pauses may also block refresh. They are not a native scheduler status.
 */
export default function StickyAdExample() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const viewportRef = useRef<View>(null);
  const measurement = useRef(0);

  // One View ref per ad slot for visibility measurement.
  const bannerRefs = useRef<(View | null)[]>(
    Array(AD_SLOT_ROWS.length).fill(null)
  );
  const [loaded, setLoaded] = useState<boolean[]>(
    Array(AD_SLOT_ROWS.length).fill(false)
  );
  const [active, setActive] = useState<boolean[]>(
    Array(AD_SLOT_ROWS.length).fill(false)
  );

  // -------------------------------------------------------------------------
  // Visibility helpers
  // -------------------------------------------------------------------------

  const checkVisibility = useCallback(() => {
    const sample = ++measurement.current;
    viewportRef.current?.measureInWindow(
      (viewportX, viewportY, viewportWidth, viewportHeight) => {
        if (sample !== measurement.current) return;
        bannerRefs.current.forEach((ref, idx) => {
          ref?.measureInWindow((x, y, width, height) => {
            if (sample !== measurement.current) return;
            const visibleBottom = Math.min(
              viewportY + viewportHeight,
              y + height
            );
            const isActive =
              height > 0 &&
              viewportHeight > 0 &&
              Math.min(viewportX + viewportWidth, x + width) > Math.max(viewportX, x) &&
              // Native's top tolerance is one physical pixel, not one React Native point.
              Math.max(0, viewportY - y) * PixelRatio.get() < 1 &&
              visibleBottom - y >= height / 2;
            setActive((prev) => {
              if (prev[idx] === isActive) return prev;
              const next = [...prev];
              next[idx] = isActive;
              return next;
            });
          });
        });
      }
    );
  }, []);

  // Poll visibility on a timer instead of the scroll listener.
  // Running measureInWindow + setState on every scroll event causes
  // 5 bridge calls + full-tree re-renders at 10 fps, which jankifies scroll.
  useEffect(() => {
    const id = setInterval(checkVisibility, 500);
    return () => { clearInterval(id); measurement.current++; };
  }, [checkVisibility]);

  // -------------------------------------------------------------------------
  // Build row list
  // -------------------------------------------------------------------------

  const indicator = (idx: number) =>
    loaded[idx] && (
      <View
        style={[
          styles.indicator,
          active[idx] ? styles.indicatorActive : styles.indicatorInactive,
        ]}
      >
        <Text
          style={[
            styles.indicatorText,
            active[idx]
              ? styles.indicatorTextActive
              : styles.indicatorTextInactive,
          ]}
        >
          {`Ad ${idx + 1} — viewport ${
            active[idx] ? 'eligible' : 'outside'
          } (estimate)`}
        </Text>
      </View>
    );

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
          <View style={styles.bannerHost}>
            {indicator(slotIdx)}
            <View
              testID={`sticky-banner-${slotIdx}`}
              ref={(el) => {
                bannerRefs.current[slotIdx] = el;
              }}
              collapsable={false}
            >
              <RemoteConfigBanner
                adConfigId={REMOTE_CONFIG.fixedBannerId}
                style={AD_SIZE}
                onAdLoaded={() => {
                  console.log(`[StickyAdExample] Ad ${i} loaded`);
                  setLoaded((prev) => {
                    const next = [...prev];
                    next[slotIdx] = true;
                    return next;
                  });
                  setTimeout(checkVisibility, 150);
                }}
                onAdFailedToLoad={(error) =>
                  console.log(`[StickyAdExample] Ad ${i} failed:`, error)
                }
              />
            </View>
            {indicator(slotIdx)}
          </View>
        </AudienzzStickyAdWrapper>
      );
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <View testID="sticky-viewport" ref={viewportRef} collapsable={false} style={styles.scroll}>
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <Text style={styles.title}>Sticky Ad Example</Text>
        <Text style={styles.subtitle}>
          Scroll down — each banner stays pinned within its reserved area as you
          scroll past it, then exits at the bottom. Remote configuration controls
          when ads load and how far ahead they prefetch.
          Refresh requires the top edge on screen and at least half the banner
          visible. The indicators above and below each ad estimate viewport
          eligibility.
        </Text>

        {rows}
      </Animated.ScrollView>
    </View>
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
