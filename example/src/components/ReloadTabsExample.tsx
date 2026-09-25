import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { AudienzzPage, OriginalBanner } from 'audienzz';
import { ADS } from '../ads_constants';

/**
 * Kept-mounted tab test for the screen-resume reload broadcast.
 *
 * Both tabs are mounted at all times — the inactive one is only hidden with
 * `display: 'none'`, never unmounted. So a banner reloading here can ONLY be
 * the result of the page impression broadcasting a reload to the
 * already-mounted banner (React never destroys/recreates it on tab switch).
 *
 * Switch A -> B -> A and watch tab A's "loads" counter tick up: the banner was
 * never remounted, yet it fetched a fresh creative when the tab became active
 * again — exactly the native "reload on screen resume" behavior. The hidden
 * tab's banner is skipped by the native visibility guard, so it does NOT burn
 * an auction while off screen.
 *
 * **Each tab is its own page.** Two retained tabs are two screens, so each gets
 * its own `AudienzzPage` and the banner inside it belongs to that tab. Wrapping
 * the whole example in one page — or reporting a screen name from the switch
 * handler and letting both banners capture whatever was current when they
 * mounted — gave both banners the SAME page key, so after a tab switch neither
 * matched the active page and the coordinator released both.
 *
 * The wrapper is what reports: toggling `active` is the page impression. An
 * explicit `pageImpression(...)` here as well would report one tab switch twice.
 *
 * Uses the same 300x250 unit (wuobgeuc) as TestScreenExample so logs line up.
 */

const TAB_KEYS = { A: 'reloadTabA', B: 'reloadTabB' } as const;

type TabId = keyof typeof TAB_KEYS;

const ReloadTabsExample = ({ onBack }: { onBack: () => void }) => {
  const [active, setActive] = React.useState<TabId>('A');
  const [loadsA, setLoadsA] = React.useState(0);
  const [loadsB, setLoadsB] = React.useState(0);

  // Selecting a tab is the whole transition: the incoming tab's <AudienzzPage>
  // becomes active and reports itself, which is what releases the outgoing
  // tab's banner and reloads the incoming one.
  const switchTo = (tab: TabId) => setActive(tab);

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
          {(['A', 'B'] as TabId[]).map((tab) => (
            // No `route` prop: this example has no navigation adapter, so each
            // wrapper owns its own focus through `active`. Passing `route`
            // without an adapter would leave the page waiting for a focus
            // report that never comes.
            <AudienzzPage
              key={tab}
              id={TAB_KEYS[tab]}
              name={TAB_KEYS[tab]}
              active={active === tab}
            >
              <View style={active === tab ? styles.visible : styles.hidden}>
                <Text style={styles.counter}>
                  Tab {tab} loads: {tab === 'A' ? loadsA : loadsB}
                </Text>
                <OriginalBanner
                  adUnitId={ADS.ORIGINAL_BANNER_HTML_300_250.adUnitId}
                  auConfigId={ADS.ORIGINAL_BANNER_HTML_300_250.auConfigId}
                  sizes={ADS.ORIGINAL_BANNER_HTML_300_250.sizes}
                  adFormats={['banner']}
                  isLazyLoad={false}
                  refreshTimeMillis={30000}
                  onAdLoaded={() =>
                    tab === 'A'
                      ? setLoadsA((n) => n + 1)
                      : setLoadsB((n) => n + 1)
                  }
                  onAdFailedToLoad={(error) =>
                    console.log(
                      `[ReloadTabs ${tab}] ERROR -> ${JSON.stringify(error, null, 2)}`
                    )
                  }
                  isReserved
                />
              </View>
            </AudienzzPage>
          ))}
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
