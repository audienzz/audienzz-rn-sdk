import * as React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Platform,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import RNAudienzz from 'audienzz';
import {
  Audienzz,
  RNTargeting,
  audienzzOnNavigationReady,
  audienzzOnNavigationStateChange,
  logAppAction,
} from 'audienzz';
import { LOREM } from './constants';
import ErrorHandlingExample from './components/ErrorHandlingExample';
import OriginalBannerAPIExample from './components/OriginalBannerAPIExample';
import OriginalInterstitialAPIExample from './components/OriginalInterstitialAPIExample';
import OriginalRewardedAPIExample from './components/OriginalRewardedAPIExample';
import LazyLoadingExample from './components/LazyLoadingExample';
import RenderingInterstitialAPIExample from './components/RenderingInterstitialAPIExample';
import RemoteConfigExample from './components/RemoteConfigExample';
import ActionButton from './components/ActionButton';
import StickyAdExample from './components/StickyAdExample';
import LegacyOriginalView_v0_3_8 from './components/LegacyOriginalView_v0_3_8';
import TestScreenExample from './components/TestScreenExample';
import ReloadTabsExample from './components/ReloadTabsExample';
import { REMOTE_CONFIG } from './remoteConfig';

const REMOTE_CONFIG_ENABLED = true;

export default function App() {
  const [initialized, setInitialized] = React.useState(false);
  const [initializationError, setInitializationError] =
    React.useState<string>();
  const [initializationSlow, setInitializationSlow] = React.useState(false);
  const [initializationAttempt, setInitializationAttempt] = React.useState(0);
  const [screen, setScreen] = React.useState<
    'main' | 'test' | 'sticky' | 'legacy' | 'reloadTabs'
  >('main');

  // This app has a hand-rolled router rather than React Navigation, so it drives the SDK's
  // navigation adapter itself. The adapter takes a React-Navigation-shaped state; a custom router
  // only has to describe which route is focused, and `<AudienzzPage route={{ key }}>` on a screen
  // then binds to that same key.
  //
  // Reporting in the navigation ACTION is the whole point: the destination's low-level banners read
  // the current page while they are being constructed, and an effect runs after that commit. A
  // parent effect therefore bound every banner to the page the reader had just left. React offers
  // no earlier parent hook — effects and layout effects both run child-first.
  const report = React.useCallback((route: string) => {
    logAppAction('navigate', { to: route });
    audienzzOnNavigationStateChange({
      index: 0,
      routes: [{ key: route, name: route }],
    });
  }, []);

  const goTo = React.useCallback(
    (next: typeof screen) => {
      report(next);
      setScreen(next);
    },
    [report]
  );

  React.useEffect(() => {
    let active = true;
    setInitializationError(undefined);
    setInitializationSlow(false);
    // A slow native callback is not proof of failure. Show recovery instructions without
    // starting another native initialization while the first one is still in flight.
    const slowTimer = setTimeout(() => {
      if (active) setInitializationSlow(true);
    }, 30_000);

    async function initialize() {
      try {
        // Overrides precede ad creation; diagnostics are enabled for this test app only.
        Audienzz.setDiagnosticsEnabled(true);
        RNAudienzz().setSmartRefreshV2Enabled(true);
        RNAudienzz().setBlankOnScreenReload(true);
        const value = REMOTE_CONFIG_ENABLED
          ? await RNAudienzz().initializeRemote(
              REMOTE_CONFIG.url,
              REMOTE_CONFIG.publisherId
            )
          : await RNAudienzz().initialize(
              'Company ID provided for the app by Audienzz'
            );
        if (!active) return;
        console.log('[SDK] Initialized:', JSON.stringify(value, null, 2));
        if (!REMOTE_CONFIG_ENABLED) {
          RNAudienzz().setSchainObject(
            JSON.stringify({
              source: {
                schain: {
                  ver: '1.0',
                  complete: 1,
                  nodes: [{ asi: 'netpoint-media.de', sid: 'np-7255', hp: 1 }],
                },
              },
            })
          );
        }
        RNTargeting().addGlobalTargeting('TEST', '1');
        // Report the opening page BEFORE its banners render, including after a failed attempt.
        audienzzOnNavigationReady({
          index: 0,
          routes: [{ key: 'main', name: 'main' }],
        });
        setInitialized(true);
      } catch (error) {
        if (!active) return;
        const code = (error as { code?: string } | null)?.code;
        setInitializationError(`${code ? `${code}: ` : ''}${String(error)}`);
        setInitializationSlow(false);
        console.error('[SDK] Initialization error:', error);
      } finally {
        clearTimeout(slowTimer);
      }
    }
    initialize();
    return () => {
      active = false;
      clearTimeout(slowTimer);
    };
  }, [initializationAttempt]);

  if (!initialized) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.initializationMessage} accessibilityRole="alert">
            {initializationError
              ? `SDK initialization failed: ${initializationError}`
              : initializationSlow
              ? 'SDK initialization is taking longer than expected (30 seconds).'
              : 'Initializing SDK...'}
          </Text>
          {(initializationError || initializationSlow) && (
            <>
              <Text style={styles.initializationHint}>
                Check the network and proxy settings.
                {Platform.OS === 'android' &&
                  ' Using Charles SSL Proxying? Install its CA certificate on this device and use the debug build. See LOCAL_TESTING.md.'}
                {initializationSlow &&
                  ' Initialization is still pending. After correcting the connection, fully close and reopen the app if it does not finish.'}
              </Text>
              {initializationError && (
                <ActionButton
                  labelButton="Retry initialization"
                  onPress={() => {
                    setInitializationError(undefined);
                    setInitializationAttempt((attempt) => attempt + 1);
                  }}
                />
              )}
            </>
          )}
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => goTo('main')}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <StickyAdExample />
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'legacy') {
    return <LegacyOriginalView_v0_3_8 onBack={() => goTo('main')} />;
  }

  if (screen === 'reloadTabs') {
    return <ReloadTabsExample onBack={() => goTo('main')} />;
  }

  return REMOTE_CONFIG_ENABLED
    ? RemoteView(
        () => goTo('test'),
        () => goTo('sticky'),
        () => goTo('legacy'),
        () => goTo('reloadTabs')
      )
    : OriginalView(
        () => goTo('test'),
        () => goTo('sticky'),
        () => goTo('legacy'),
        () => goTo('reloadTabs')
      );
}

function RemoteView(
  onOpenTest: () => void,
  onOpenSticky: () => void,
  onOpenLegacy: () => void,
  onOpenReloadTabs: () => void
) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.mainContainer}
        contentContainerStyle={styles.remoteContent}
      >
        <RemoteConfigExample onOpenTestScreen={onOpenTest} />
        <View style={styles.otherExamples}>
          <Text style={styles.otherExamplesTitle}>Other examples</Text>
          <ActionButton
            labelButton="Sticky ad →"
            variant="secondary"
            onPress={onOpenSticky}
          />
          <ActionButton
            labelButton="Reload tabs →"
            variant="secondary"
            onPress={onOpenReloadTabs}
          />
          <ActionButton
            labelButton="Legacy (v0.3.8) →"
            variant="secondary"
            onPress={onOpenLegacy}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function OriginalView(
  onOpenTest: () => void,
  onOpenSticky: () => void,
  onOpenLegacy: () => void,
  onOpenReloadTabs: () => void
) {
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
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  initializationMessage: {
    color: '#0F172A',
    fontSize: 18,
    textAlign: 'center',
  },
  initializationHint: {
    color: '#475569',
    marginVertical: 16,
    lineHeight: 22,
    textAlign: 'center',
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
  remoteContent: {
    paddingTop: 20,
    paddingBottom: 32,
  },
  otherExamples: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#CBD5E1',
  },
  otherExamplesTitle: {
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
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
