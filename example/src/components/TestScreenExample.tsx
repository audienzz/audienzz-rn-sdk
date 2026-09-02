import React from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { OriginalBanner } from 'audienzz';
import { ADS } from '../ads_constants';

/**
 * Minimal second screen for testing per-screen analytics / screen tracking, mirroring the
 * native example's "ad screen" (RemoteConfigAdScreenViewController / RemoteConfigAdActivity).
 *
 * The App reports this route via `onScreenResumed('test')` on entry and `onScreenResumed('main')`
 * on Back, so navigating Home -> Test Screen -> Home produces a fresh `pageImpression` per visit
 * and the banner's auction events are attributed to `screen_name: test`. Uses the same 300x250
 * unit (wuobgeuc) as the native example so logs line up across platforms.
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
            One banner on its own screen — for screen-tracking / analytics logs.
          </Text>
          <View style={styles.height30} />
          <OriginalBanner
            adUnitId={ADS.ORIGINAL_BANNER_HTML_300_250.adUnitId}
            auConfigId={ADS.ORIGINAL_BANNER_HTML_300_250.auConfigId}
            sizes={ADS.ORIGINAL_BANNER_HTML_300_250.sizes}
            adFormats={['banner']}
            isLazyLoad={false}
            refreshTimeMillis={30000}
            onAdLoaded={() => console.log('[TestScreen] banner loaded')}
            onAdFailedToLoad={(error) =>
              console.log(`[TestScreen] banner ERROR -> ${JSON.stringify(error, null, 2)}`)
            }
            isReserved
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
  backButton: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F5F5F5' },
  backButtonText: { fontSize: 16, color: '#1565C0', fontWeight: '600' },
});

export default TestScreenExample;
