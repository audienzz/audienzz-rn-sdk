import * as React from 'react';
import { ScrollView, Text, TouchableOpacity, View, Platform, StyleSheet, SafeAreaView } from 'react-native';
import RNAudienzz from 'audienzz';
import { Audienzz, RNTargeting, createPage } from 'audienzz';
import { LOREM } from './constants';
import ErrorHandlingExample from './components/ErrorHandlingExample';
import OriginalBannerAPIExample from './components/OriginalBannerAPIExample';
import OriginalInterstitialAPIExample from './components/OriginalInterstitialAPIExample';
import OriginalRewardedAPIExample from './components/OriginalRewardedAPIExample';
import LazyLoadingExample from './components/LazyLoadingExample';
import RenderingInterstitialAPIExample from './components/RenderingInterstitialAPIExample';
import RemoteConfigExample from './components/RemoteConfigExample';
import StickyAdExample from './components/StickyAdExample';
import SmartRefreshBannerExample from './components/SmartRefreshBannerExample';
import LegacyOriginalView_v0_3_8 from './components/LegacyOriginalView_v0_3_8';
import TestScreenExample from './components/TestScreenExample';
import ReloadTabsExample from './components/ReloadTabsExample';

// Remote config ad units (IDs 118, 192, 267) are only provisioned for iOS on
// the dev backend — Android returns HTTP 404 for publisher 81.  Use the direct
// OriginalBanner flow on Android so the initial screen always shows live ads.
const REMOTE_CONFIG_ENABLED = Platform.OS === 'ios';
const REMOTE_CONFIG_URL = 'https://api.adnz.co/api/ws-sdk-config/public/v1';
const PUBLISHER_ID = '81';

export default function App() {
  const [initialized, setInitialized] = React.useState(false);
  const [screen, setScreen] = React.useState<'main' | 'test' | 'sticky' | 'smartRefresh' | 'legacy' | 'reloadTabs'>('main');

  // Navigate. Reporting the page here — in the navigation ACTION — is the whole point: the
  // destination's banners read the current page while they are being constructed, and an effect
  // runs after that commit. A parent effect therefore bound every banner to the page the reader had
  // just left. React offers no earlier parent hook: effects and layout effects both run child-first.
  //
  // For screens built with <AudienzzPage>/<AudienzzBanner> this is handled for you; this example
  // still uses the low-level components in places, which is why it reports explicitly.
  const goTo = React.useCallback((next: typeof screen) => {
    Audienzz.activatePage(createPage(next));
    setScreen(next);
  }, []);

  React.useEffect(() => {
    // Pages are reported by `goTo` at the navigation action, and the first one right after
    // initialization — never from render, layout or a parent effect.
    // Opt into smart-refresh v2 (directional viewport gate) instead of the legacy 20% gate,
    // and blank the slot during a screen-resume reload — parity with the native iOS/Android SDKs.
    // Both override backend config for the session; call before creating banners.
    RNAudienzz().setSmartRefreshV2Enabled(true);
    RNAudienzz().setBlankOnScreenReload(true);
    if (REMOTE_CONFIG_ENABLED) {
      RNAudienzz()
        .initializeRemote(
          REMOTE_CONFIG_URL,
          PUBLISHER_ID
        )
        .then((value) => {
          console.log('[SDK] Initialized with remote config:', JSON.stringify(value, null, 2));
          RNTargeting().addGlobalTargeting('TEST', '1');
          // The first page, reported BEFORE the first ad-bearing screen renders. Nothing has been
          // rendered yet because `initialized` still gates the whole tree.
          Audienzz.activatePage(createPage('main'));
          setInitialized(true);
        })
        .catch((error) => {
          console.error('[SDK] Initialization error:', error);
        });
    } else {
      RNAudienzz()
        .initialize('Company ID provided for the app by Audienzz')
        .then((value) => {
          console.log(JSON.stringify(value, null, 2));
          RNAudienzz().setSchainObject(`
                              { "source": 
                                  { "schain": {
                                      "ver": "1.0",
                                      "complete": 1,
                                      "nodes": [
                                          {
                                              "asi": "netpoint-media.de",
                                              "sid": "np-7255",
                                              "hp": 1
                                          }
                                        ]
                                      }
                                  } 
                              }
                          `);
          RNTargeting().addGlobalTargeting('TEST', '1');
          Audienzz.activatePage(createPage('main'));
          setInitialized(true);
        });
    }
  }, []);


  if (!initialized) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>Initializing SDK...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'test') {
    return <TestScreenExample onBack={() => goTo('main')} />;
  }

  if (screen === 'sticky') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => goTo('main')}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <StickyAdExample />
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'smartRefresh') {
    return (
      <View style={styles.mainContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => goTo('main')}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <SmartRefreshBannerExample />
      </View>
    );
  }

  if (screen === 'legacy') {
    return <LegacyOriginalView_v0_3_8 onBack={() => goTo('main')} />;
  }

  if (screen === 'reloadTabs') {
    return <ReloadTabsExample onBack={() => goTo('main')} />;
  }

  return REMOTE_CONFIG_ENABLED
    ? RemoteView(() => goTo('test'), () => goTo('sticky'), () => goTo('smartRefresh'), () => goTo('legacy'), () => goTo('reloadTabs'))
    : OriginalView(() => goTo('test'), () => goTo('sticky'), () => goTo('smartRefresh'), () => goTo('legacy'), () => goTo('reloadTabs'));
}

function RemoteView(onOpenTest: () => void, onOpenSticky: () => void, onOpenSmartRefresh: () => void, onOpenLegacy: () => void, onOpenReloadTabs: () => void) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.mainContainer}
          contentContainerStyle={styles.scrollviewcontentContainerStyle}
        >
          <Text style={styles.bigText}>TEST SCREEN</Text>
          <TouchableOpacity style={styles.navButton} onPress={onOpenTest}>
            <Text style={styles.navButtonText}>Open Test Screen →</Text>
          </TouchableOpacity>
          <View style={styles.height30} />
          <Text style={styles.bigText}>STICKY AD</Text>
          <TouchableOpacity style={styles.navButton} onPress={onOpenSticky}>
            <Text style={styles.navButtonText}>Open Sticky Ad Example →</Text>
          </TouchableOpacity>
          <View style={styles.height30} />
          <Text style={styles.bigText}>SMART REFRESH</Text>
          <TouchableOpacity style={styles.navButton} onPress={onOpenSmartRefresh}>
            <Text style={styles.navButtonText}>Open Smart Refresh Example →</Text>
          </TouchableOpacity>
          <View style={styles.height30} />
          <Text style={styles.bigText}>RELOAD TABS</Text>
          <TouchableOpacity style={styles.navButton} onPress={onOpenReloadTabs}>
            <Text style={styles.navButtonText}>Open Reload Tabs Example →</Text>
          </TouchableOpacity>
          <View style={styles.height30} />
          <Text style={styles.bigText}>REMOTE CONFIG</Text>
          <RemoteConfigExample />
          <View style={styles.height30} />
          <Text style={styles.bigText}>LEGACY (v0.3.8)</Text>
          <TouchableOpacity style={styles.navButton} onPress={onOpenLegacy}>
            <Text style={styles.navButtonText}>Open Legacy Example →</Text>
          </TouchableOpacity>
          <View style={styles.height30} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function OriginalView(onOpenTest: () => void, onOpenSticky: () => void, onOpenSmartRefresh: () => void, onOpenLegacy: () => void, onOpenReloadTabs: () => void) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.mainContainer}
          contentContainerStyle={styles.scrollviewcontentContainerStyle}
        >
          <Text style={styles.bigText}>TEST SCREEN</Text>
          <TouchableOpacity style={styles.navButton} onPress={onOpenTest}>
            <Text style={styles.navButtonText}>Open Test Screen →</Text>
          </TouchableOpacity>
          <View style={styles.height30} />
          <Text style={styles.bigText}>STICKY AD</Text>
          <TouchableOpacity style={styles.navButton} onPress={onOpenSticky}>
            <Text style={styles.navButtonText}>Open Sticky Ad Example →</Text>
          </TouchableOpacity>
          <View style={styles.height30} />
          <Text style={styles.bigText}>SMART REFRESH</Text>
          <TouchableOpacity style={styles.navButton} onPress={onOpenSmartRefresh}>
            <Text style={styles.navButtonText}>Open Smart Refresh Example →</Text>
          </TouchableOpacity>
          <View style={styles.height30} />
          <Text style={styles.bigText}>RELOAD TABS</Text>
          <TouchableOpacity style={styles.navButton} onPress={onOpenReloadTabs}>
            <Text style={styles.navButtonText}>Open Reload Tabs Example →</Text>
          </TouchableOpacity>
          <View style={styles.height30} />
          <Text style={styles.bigText}>ORIGINAL</Text>
          <ErrorHandlingExample />
          <View style={styles.height30} />
          <OriginalBannerAPIExample />
          <View style={styles.height30} />
          <OriginalInterstitialAPIExample />
          <View style={styles.height30} />
          <OriginalRewardedAPIExample />
          <View style={styles.height30} />
          <View style={styles.height30} />
          <Text style={styles.bigText}>RENDERING</Text>
          {/* <RenderingBannerAPIExample /> */}
          <View style={styles.height30} />
          <RenderingInterstitialAPIExample />
          <View style={styles.height30} />
          {/* <RenderingRewardedAPIExample /> */}
          <Text style={styles.lorem}>{LOREM}</Text>
          <Text style={styles.bigText}>LAZY LOADING</Text>
          <LazyLoadingExample />
          <View style={styles.height30} />
          <Text style={styles.bigText}>LEGACY (v0.3.8)</Text>
          <TouchableOpacity style={styles.navButton} onPress={onOpenLegacy}>
            <Text style={styles.navButtonText}>Open Legacy Example →</Text>
          </TouchableOpacity>
          <View style={styles.height30} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  scrollviewcontentContainerStyle: {
    alignItems: 'center',
    paddingHorizontal: 12,
    ...Platform.select({
      android: {
        paddingTop: 20,
        paddingBottom: 30,
      },
    }),
  },
  height30: {
    height: 30,
  },
  lorem: {
    marginVertical: 50,
    color: '#000',
  },
  bigText: {
    marginBottom: 30,
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  backButtonText: {
    fontSize: 16,
    color: '#1565C0',
    fontWeight: '600',
  },
  navButton: {
    backgroundColor: '#1565C0',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
