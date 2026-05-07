import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { OriginalBanner } from 'audienzz';
import { ADS } from '../ads_constants';

// An ad must have at least 20 % of its height visible to count as "active".
const VISIBILITY_THRESHOLD = 0.2;

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor ' +
  'incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud ' +
  'exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure ' +
  'dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ' +
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit ' +
  'anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem ' +
  'accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore.';

/**
 * Demonstrates smart-refresh with per-banner active/inactive visual indicators.
 *
 * On iOS the RN ScrollView maps to a native UIScrollView, so AUBannerView's
 * internal VisibleView KVO fires naturally — onBecameVisible / onBecameHidden
 * handle pause/resume automatically.  On Android the OnPreDrawListener +
 * getGlobalVisibleRect approach works the same way.
 *
 * The green/red indicator is driven purely by JS-side measureInWindow checks on
 * each scroll event — it mirrors the native state without additional bridge calls.
 */
export default function SmartRefreshBannerExample() {
  const banner1Ref = useRef<View>(null);
  const banner2Ref = useRef<View>(null);
  const banner3Ref = useRef<View>(null);

  const [banner1Loaded, setBanner1Loaded] = useState(false);
  const [banner2Loaded, setBanner2Loaded] = useState(false);
  const [banner3Loaded, setBanner3Loaded] = useState(false);

  const [banner1Active, setBanner1Active] = useState(false);
  const [banner2Active, setBanner2Active] = useState(false);
  const [banner3Active, setBanner3Active] = useState(false);

  // ---------------------------------------------------------------------------
  // Visibility helpers
  // ---------------------------------------------------------------------------

  const checkVisibility = useCallback(() => {
    const windowHeight = Dimensions.get('window').height;

    const check = (
      ref: React.RefObject<View>,
      setActive: (v: boolean) => void,
    ) => {
      ref.current?.measureInWindow((_x, y, _w, height) => {
        if (height === 0) return;
        const visibleTop = Math.max(0, y);
        const visibleBottom = Math.min(windowHeight, y + height);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        setActive(visibleHeight / height >= VISIBILITY_THRESHOLD);
      });
    };

    check(banner1Ref, setBanner1Active);
    check(banner2Ref, setBanner2Active);
    check(banner3Ref, setBanner3Active);
  }, []);

  useEffect(() => {
    // Initial check once the layout settles.
    const timer = setTimeout(checkVisibility, 500);
    return () => clearTimeout(timer);
  }, [checkVisibility]);

  const handleScroll = useCallback(
    (_e: NativeSyntheticEvent<NativeScrollEvent>) => {
      checkVisibility();
    },
    [checkVisibility],
  );

  // ---------------------------------------------------------------------------
  // Indicator badge
  // ---------------------------------------------------------------------------

  const renderIndicator = (loaded: boolean, active: boolean, label: string) => {
    if (!loaded) return null;
    return (
      <View
        style={[
          styles.indicator,
          active ? styles.indicatorActive : styles.indicatorInactive,
        ]}
      >
        <Text
          style={[
            styles.indicatorText,
            active ? styles.indicatorTextActive : styles.indicatorTextInactive,
          ]}
        >
          {active
            ? `● ${label} — Active (refreshing)`
            : `○ ${label} — Inactive (paused)`}
        </Text>
      </View>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      onScroll={handleScroll}
      scrollEventThrottle={100}
    >
      <Text style={styles.title}>Smart Refresh</Text>
      <Text style={styles.subtitle}>
        Scroll ads off-screen — refresh pauses. Scroll back — the timer resumes
        from where it left off (≥20 % visibility rule).
      </Text>

      {/* ── Banner 1 — 320×50 top ─────────────────────────────────────────── */}
      <View style={styles.adSection}>
        <Text style={styles.adLabel}>Banner 320×50 (Top)</Text>
        {renderIndicator(banner1Loaded, banner1Active, '320×50')}
        <View ref={banner1Ref} collapsable={false}>
          <OriginalBanner
            adUnitId={ADS.ORIGINAL_BANNER_HTML_320_50.adUnitId}
            auConfigId={ADS.ORIGINAL_BANNER_HTML_320_50.auConfigId}
            sizes={ADS.ORIGINAL_BANNER_HTML_320_50.sizes}
            adFormats={['banner']}
            isLazyLoad={false}
            smartRefresh={true}
            refreshTimeMillis={30000}
            isReserved
            onAdLoaded={() => {
              console.log('[SmartRefresh] Banner 320×50 (top) loaded');
              setBanner1Loaded(true);
              setTimeout(checkVisibility, 150);
            }}
            onAdFailedToLoad={(error) =>
              console.log(
                `[SmartRefresh] Banner 320×50 (top) failed: ${JSON.stringify(error)}`,
              )
            }
          />
        </View>
      </View>

      <Text style={styles.lorem}>{LOREM}</Text>
      <Text style={styles.lorem}>{LOREM}</Text>

      {/* ── Banner 2 — 300×250 middle ─────────────────────────────────────── */}
      <View style={styles.adSection}>
        <Text style={styles.adLabel}>Banner 300×250 (Middle)</Text>
        {renderIndicator(banner2Loaded, banner2Active, '300×250')}
        <View ref={banner2Ref} collapsable={false}>
          <OriginalBanner
            adUnitId={ADS.ORIGINAL_BANNER_HTML_300_250.adUnitId}
            auConfigId={ADS.ORIGINAL_BANNER_HTML_300_250.auConfigId}
            sizes={[{ width: 300, height: 250 }]}
            adFormats={['banner']}
            isLazyLoad={false}
            smartRefresh={true}
            refreshTimeMillis={30000}
            isReserved
            onAdLoaded={() => {
              console.log('[SmartRefresh] Banner 300×250 loaded');
              setBanner2Loaded(true);
              setTimeout(checkVisibility, 150);
            }}
            onAdFailedToLoad={(error) =>
              console.log(
                `[SmartRefresh] Banner 300×250 failed: ${JSON.stringify(error)}`,
              )
            }
          />
        </View>
      </View>

      <Text style={styles.lorem}>{LOREM}</Text>
      <Text style={styles.lorem}>{LOREM}</Text>

      {/* ── Banner 3 — 320×50 bottom ──────────────────────────────────────── */}
      <View style={styles.adSection}>
        <Text style={styles.adLabel}>Banner 320×50 (Bottom)</Text>
        {renderIndicator(banner3Loaded, banner3Active, '320×50')}
        <View ref={banner3Ref} collapsable={false}>
          <OriginalBanner
            adUnitId={ADS.ORIGINAL_BANNER_HTML_320_50.adUnitId}
            auConfigId={ADS.ORIGINAL_BANNER_HTML_320_50.auConfigId}
            sizes={ADS.ORIGINAL_BANNER_HTML_320_50.sizes}
            adFormats={['banner']}
            isLazyLoad={false}
            smartRefresh={true}
            refreshTimeMillis={30000}
            isReserved
            onAdLoaded={() => {
              console.log('[SmartRefresh] Banner 320×50 (bottom) loaded');
              setBanner3Loaded(true);
              setTimeout(checkVisibility, 150);
            }}
            onAdFailedToLoad={(error) =>
              console.log(
                `[SmartRefresh] Banner 320×50 (bottom) failed: ${JSON.stringify(error)}`,
              )
            }
          />
        </View>
      </View>

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
    marginBottom: 24,
    lineHeight: 20,
  },
  adSection: {
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  adLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 6,
    alignSelf: 'flex-start',
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
  lorem: {
    marginVertical: 16,
    color: '#616161',
    fontSize: 14,
    lineHeight: 20,
  },
  bottomPad: {
    height: 60,
  },
});
