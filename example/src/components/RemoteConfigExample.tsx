import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  RemoteConfigBanner,
  RemoteConfigInterstitial,
  type RemoteConfigInterstitialHandle,
} from 'audienzz';
import ActionButton from './ActionButton';
import { REMOTE_CONFIG } from '../remoteConfig';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor ' +
  'incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud ' +
  'exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure ' +
  'dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ' +
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit ' +
  'anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem ' +
  'accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore.';

export default function RemoteConfigExample({
  onOpenTestScreen,
}: {
  onOpenTestScreen?: () => void;
}) {
  const interstitial = React.useRef<RemoteConfigInterstitialHandle>(null);
  // One line that always says where the ad is. Callbacks alone leave the state in the log; a
  // reader has to reconstruct it from scrollback and cannot see that `prefetch` finished WITHOUT
  // presenting — which is the guarantee the three separate buttons exist to demonstrate.
  const [status, setStatus] = React.useState('not loaded');

  // One under every ad slot, matching the native examples: the screen-navigation test is about
  // what happens to THAT banner when you leave and come back, so the button has to be reachable
  // while the slot it concerns is on screen.
  const navButton = () =>
    onOpenTestScreen ? (
      <ActionButton
        labelButton="Open test screen →"
        variant="secondary"
        buttonStyle={styles.navigationButton}
        onPress={onOpenTestScreen}
      />
    ) : null;

  return (
    <View style={styles.container}>
      <View style={styles.introduction}>
        <Text style={styles.title}>Remote ads</Text>
        <Text style={styles.subtitle}>
          Scroll banners off-screen and back to test smart refresh. Open the
          test screen below either banner, then return to test page changes.
          Native diagnostics show when refresh is held or an auction starts.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Fixed Size Banner (ID: {REMOTE_CONFIG.fixedBannerId})
        </Text>
        <View style={styles.bannerContainer}>
          <RemoteConfigBanner
            adConfigId={REMOTE_CONFIG.fixedBannerId}
            style={styles.fixedBanner}
            onAdLoaded={(size) => {
              console.log('[RemoteConfig] Fixed banner loaded:', size);
            }}
            onAdFailedToLoad={(error) => {
              console.log('[RemoteConfig] Fixed banner failed:', error);
            }}
            onAdClicked={() => {
              console.log('[RemoteConfig] Fixed banner clicked');
            }}
          />
        </View>
        {navButton()}
      </View>

      <View style={styles.articleContent}>
        <Text style={styles.longLabel}>{LOREM}</Text>
        <Text style={styles.longLabel}>{LOREM}</Text>
      </View>

      <View style={styles.adaptiveSection}>
        <Text style={[styles.sectionTitle, styles.adaptiveSectionTitle]}>
          Adaptive Banner (ID: {REMOTE_CONFIG.adaptiveBannerId})
        </Text>
        <View style={styles.adaptiveBannerContainer}>
          <RemoteConfigBanner
            adConfigId={REMOTE_CONFIG.adaptiveBannerId}
            style={styles.adaptiveBanner}
            onAdLoaded={(size) => {
              console.log('[RemoteConfig] Adaptive banner loaded:', size);
            }}
            onAdFailedToLoad={(error) => {
              console.log('[RemoteConfig] Adaptive banner failed:', error);
            }}
            onAdClicked={() => {
              console.log('[RemoteConfig] Adaptive banner clicked');
            }}
          />
        </View>
        <View style={styles.adaptiveActions}>{navButton()}</View>
      </View>

      <View style={styles.articleContent}>
        <Text style={styles.longLabel}>{LOREM}</Text>
        <Text style={styles.longLabel}>{LOREM}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Interstitial (ID: {REMOTE_CONFIG.interstitialId})
        </Text>
        <Text style={styles.status}>{status}</Text>
        <ActionButton
          labelButton="Prefetch"
          variant="secondary"
          onPress={() => {
            setStatus('loading…');
            interstitial.current?.prefetch();
          }}
        />
        <ActionButton
          labelButton="Show"
          onPress={() => {
            // Reported rather than silently queued: `show` takes an opportunity or skips it.
            if (!interstitial.current?.isReady()) {
              setStatus('not ready — nothing to show (prefetch first)');
              return;
            }
            interstitial.current?.show(true);
          }}
        />
        <ActionButton
          labelButton="Prefetch and show"
          variant="secondary"
          onPress={() => {
            setStatus('loading… (will show when ready)');
            interstitial.current?.prefetchAndShow();
          }}
        />
        <ActionButton
          labelButton="Test ineligible opportunity"
          variant="secondary"
          onPress={() => {
            setStatus('ineligible opportunity — must be skipped');
            interstitial.current?.show(false);
          }}
        />
      </View>

      {/* Keep one owner mounted; loading never queues presentation. */}
      <RemoteConfigInterstitial
        ref={interstitial}
        manualControl
        adConfigId={REMOTE_CONFIG.interstitialId}
        onAdLoaded={() => {
          // After a plain `prefetch` this is where it stops: ready, and nothing on screen.
          setStatus('ready to show');
          console.log('[RemoteConfig] Interstitial loaded successfully');
        }}
        onAdFailedToLoad={(error) => {
          setStatus(`load failed: ${JSON.stringify(error)}`);
          console.log('[RemoteConfig] Interstitial failed to load:', error);
        }}
        onAdFailedToShow={(error) => {
          setStatus(`failed to show: ${JSON.stringify(error)}`);
          console.log('[RemoteConfig] Presentation failed:', error);
        }}
        onLifecycleEvent={(event) => {
          // Carries the skip reason when an opportunity is declined.
          const name = (event as { event?: string })?.event;
          if (name === 'opportunitySkipped') {
            setStatus(`opportunity skipped: ${JSON.stringify(event)}`);
          }
          console.log('[RemoteConfig] Lifecycle:', event);
        }}
        onAdOpened={() => {
          setStatus('showing');
          console.log('[RemoteConfig] Interstitial opened');
        }}
        onAdClosed={() => {
          // Inventory is spent on presentation, so the slot really is empty again.
          setStatus('closed — not loaded');
          console.log('[RemoteConfig] Interstitial closed');
        }}
        onAdClicked={() => {
          setStatus('clicked');
          console.log('[RemoteConfig] Interstitial clicked');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  introduction: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
  },
  articleContent: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  section: {
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  adaptiveSection: {
    width: '100%',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  adaptiveSectionTitle: {
    marginHorizontal: 16,
  },
  adaptiveActions: {
    paddingHorizontal: 16,
  },
  navigationButton: {
    marginTop: 12,
  },
  bannerContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    minHeight: 100,
  },
  status: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#616161',
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
  },
  adaptiveBannerContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minHeight: 100,
  },
  fixedBanner: {
    width: 300,
    height: 250,
  },
  adaptiveBanner: {
    width: '100%',
  },
  longLabel: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
});
