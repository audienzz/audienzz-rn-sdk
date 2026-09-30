import React from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { RemoteConfigBanner } from 'audienzz';
import { REMOTE_CONFIG } from '../remoteConfig';

/**
 * Minimal second screen for testing per-screen analytics / screen tracking, mirroring the
 * native example's "ad screen" (RemoteConfigAdScreenViewController / RemoteConfigAdActivity).
 *
 * The App reports this route via `pageImpression('test')` on entry and `pageImpression('main')`
 * on Back, so navigating Home -> Test Screen -> Home produces a fresh `pageImpression` per visit
 * and the banner's auction events are attributed to `screen_name: test`. Uses the same remote
 * fixed banner placement as the main screen, with delivery settings supplied by the backend.
 */
const TestScreenExample = ({ onBack }: { onBack: () => void }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Test Screen</Text>
          <Text style={styles.subtitle}>
            One remote banner on its own screen — for screen-tracking / analytics logs.
          </Text>
          <View style={styles.height30} />
          <RemoteConfigBanner
            adConfigId={REMOTE_CONFIG.fixedBannerId}
            style={styles.banner}
            onAdLoaded={() => console.log('[TestScreen] banner loaded')}
            onAdFailedToLoad={(error) =>
              console.log(`[TestScreen] banner ERROR -> ${JSON.stringify(error, null, 2)}`)
            }
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  container: { flex: 1, backgroundColor: 'white' },
  content: { alignItems: 'center', paddingHorizontal: 12, paddingBottom: 30 },
  title: { marginTop: 20, fontSize: 28, fontWeight: '700', color: '#000' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#444', textAlign: 'center' },
  height30: { height: 30 },
  banner: { width: 300, height: 250 },
  backButton: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F5F5F5' },
  backButtonText: { fontSize: 16, color: '#1565C0', fontWeight: '600' },
});

export default TestScreenExample;
