import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import {
  RemoteConfigBanner,
  RemoteConfigInterstitial,
  type RemoteConfigInterstitialHandle,
} from 'audienzz';
import ActionButton from './ActionButton';

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
  const navButton = (label: string) =>
    onOpenTestScreen ? (
      <ActionButton labelButton={label} onPress={onOpenTestScreen} />
    ) : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Remote Config Test</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fixed Size Banner (ID: 118)</Text>
        <View style={styles.bannerContainer}>
          <RemoteConfigBanner
            adConfigId="118"
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
        {navButton('Open test screen (from fixed banner) →')}
      </View>

      <View style={styles.section}>
        <Text style={styles.longLabel}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum
          leo metus, sagittis nec finibus eu, viverra vel eros. Donec lobortis,
          metus nec maximus viverra, nunc mi fermentum lorem, quis fermentum est
          turpis ac risus. Nullam sed nunc aliquam, scelerisque felis at,
          malesuada magna. Aliquam tincidunt, odio at ultricies lacinia, purus
          nunc feugiat ipsum, ac scelerisque purus elit nec ligula. Donec neque
          quam, auctor sit amet velit a, porta cursus metus. Nullam interdum
          posuere odio quis ultricies. Donec vulputate vulputate magna, eu
          scelerisque erat bibendum in.
        </Text>
      </View>

      <View style={styles.adaptiveSection}>
        <Text style={[styles.sectionTitle, styles.adaptiveSectionTitle]}>
          Adaptive Banner (ID: 192)
        </Text>
        <View style={styles.adaptiveBannerContainer}>
          <RemoteConfigBanner
            adConfigId="192"
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
        {navButton('Open test screen (from adaptive banner) →')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interstitial (ID: 267)</Text>
        <Text style={styles.status}>{status}</Text>
        <ActionButton
          labelButton="Prefetch"
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
          onPress={() => {
            setStatus('loading… (will show when ready)');
            interstitial.current?.prefetchAndShow();
          }}
        />
        <ActionButton
          labelButton="Try An Ineligible Opportunity"
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
        adConfigId="267"
        onAdLoaded={() => {
          // After a plain `prefetch` this is where it stops: ready, and nothing on screen.
          setStatus('ready to show');
          console.log('[RemoteConfig] Interstitial loaded successfully');
        }}
        onAdFailedToLoad={(error) => {
          setStatus(`load failed: ${String(error)}`);
          console.log('[RemoteConfig] Interstitial failed to load:', error);
        }}
        onAdFailedToShow={(error) => {
          setStatus(`failed to show: ${String(error)}`);
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
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
    textAlign: 'justify',
  },
  buttonSpacing: {
    height: 12,
  },
});
