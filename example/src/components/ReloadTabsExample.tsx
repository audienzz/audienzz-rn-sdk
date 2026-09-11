import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import RNAudienzz, { OriginalBanner } from 'audienzz';
import { ADS } from '../ads_constants';

/**
 * Kept-mounted tab test for the screen-resume reload broadcast.
 *
 * Both tabs are mounted at all times — the inactive one is only hidden with
 * `display: 'none'`, never unmounted. So a banner reloading here can ONLY be
 * the result of `Audienzz.pageImpression(...)` broadcasting a reload to the
 * already-mounted banner (React never destroys/recreates it on tab switch).
 *
 * Switch A -> B -> A and watch tab A's "loads" counter tick up: the banner was
 * never remounted, yet it fetched a fresh creative when the tab became active
 * again — exactly the native "reload on screen resume" behavior. The hidden
 * tab's banner is skipped by the native visibility guard, so it does NOT burn
 * an auction while off screen.
 *
 * Uses the same 300x250 unit (wuobgeuc) as TestScreenExample so logs line up.
 */

const TAB_KEYS = { A: 'reloadTabA', B: 'reloadTabB' } as const;

type TabId = keyof typeof TAB_KEYS;

const ReloadTabsExample = ({ onBack }: { onBack: () => void }) => {
  const [active, setActive] = React.useState<TabId>('A');
  const [loadsA, setLoadsA] = React.useState(0);
  const [loadsB, setLoadsB] = React.useState(0);

  const switchTo = (tab: TabId) => {
    if (tab === active) return;
    setActive(tab);
    // Report the newly active route. The SDK fires a fresh pageImpression AND
    // broadcasts a reload to every mounted banner; only the now-visible one
    // (this tab's banner) actually reloads.
    RNAudienzz().pageImpression(TAB_KEYS[tab]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Reload-on-resume (kept mounted)</Text>
        <Text style={styles.subtitle}>
          Both tabs stay mounted. Switch A → B → A and watch the counter: the
          banner reloads without ever being recreated.
        </Text>

        <View style={styles.tabBar}>
          {(['A', 'B'] as TabId[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, active === tab && styles.tabActive]}
              onPress={() => switchTo(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  active === tab && styles.tabTextActive,
                ]}
              >
                Tab {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Both tabs are always in the tree; inactive is hidden, not unmounted. */}
        <View style={styles.tabsHost}>
          <View style={active === 'A' ? styles.visible : styles.hidden}>
            <Text style={styles.counter}>Tab A loads: {loadsA}</Text>
            <OriginalBanner
              adUnitId={ADS.ORIGINAL_BANNER_HTML_300_250.adUnitId}
              auConfigId={ADS.ORIGINAL_BANNER_HTML_300_250.auConfigId}
              sizes={ADS.ORIGINAL_BANNER_HTML_300_250.sizes}
              adFormats={['banner']}
              isLazyLoad={false}
              refreshTimeMillis={30000}
              onAdLoaded={() => setLoadsA((n) => n + 1)}
              onAdFailedToLoad={(error) =>
                console.log(
                  `[ReloadTabs A] ERROR -> ${JSON.stringify(error, null, 2)}`
                )
              }
              isReserved
            />
          </View>

          <View style={active === 'B' ? styles.visible : styles.hidden}>
            <Text style={styles.counter}>Tab B loads: {loadsB}</Text>
            <OriginalBanner
              adUnitId={ADS.ORIGINAL_BANNER_HTML_300_250.adUnitId}
              auConfigId={ADS.ORIGINAL_BANNER_HTML_300_250.auConfigId}
              sizes={ADS.ORIGINAL_BANNER_HTML_300_250.sizes}
              adFormats={['banner']}
              isLazyLoad={false}
              refreshTimeMillis={30000}
              onAdLoaded={() => setLoadsB((n) => n + 1)}
              onAdFailedToLoad={(error) =>
                console.log(
                  `[ReloadTabs B] ERROR -> ${JSON.stringify(error, null, 2)}`
                )
              }
              isReserved
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  container: { flex: 1, backgroundColor: 'white' },
  title: { marginTop: 16, fontSize: 24, fontWeight: '700', color: '#000', paddingHorizontal: 16 },
  subtitle: { marginTop: 8, fontSize: 14, color: '#444', paddingHorizontal: 16 },
  tabBar: { flexDirection: 'row', marginTop: 20, paddingHorizontal: 16 },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  tabActive: { backgroundColor: '#1565C0' },
  tabText: { fontSize: 16, fontWeight: '600', color: '#333' },
  tabTextActive: { color: '#FFF' },
  tabsHost: { flex: 1, alignItems: 'center', paddingTop: 24 },
  visible: { alignItems: 'center' },
  hidden: { display: 'none' },
  counter: { fontSize: 16, fontWeight: '600', color: '#1565C0', marginBottom: 12 },
  backButton: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F5F5F5' },
  backButtonText: { fontSize: 16, color: '#1565C0', fontWeight: '600' },
});

export default ReloadTabsExample;
