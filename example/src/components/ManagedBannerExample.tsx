import * as React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { AudienzzBanner, AudienzzPage } from 'audienzz';
import { LOREM } from '../constants';

/**
 * The complete managed integration. This is the pattern to copy.
 *
 * The publisher places one component. There is no `load()`, no `Timer`, no reload after a page
 * impression or an app resume, and no disposal: `AudienzzPage` owns the page identity and
 * `AudienzzBanner` owns the slot's whole lifetime.
 */
export default function ManagedBannerExample({ onBack }: { onBack: () => void }) {
  return (
    // One wrapper per screen. `route` is the key this app's router reported for this screen (see
    // App.tsx, which drives `audienzzOnNavigationStateChange`), so the wrapper and the adapter
    // agree on the identity without either guessing. With React Navigation you pass the `route`
    // prop it hands your screen instead.
    //
    // The wrapper reports the page and owns it, so two articles are two pages even though both are
    // called "article".
    <AudienzzPage name="article" route={{ key: 'managed' }}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <ScrollView>
          <Text style={styles.body}>{LOREM}</Text>

          {/* Reserves its height immediately, loads as it nears the viewport. */}
          <AudienzzBanner
            adConfigId="118"
            slotKey="in-content-1"
            placeholderHeight={250}
          />

          <Text style={styles.body}>{LOREM}</Text>

          {/* Same configuration id, different slot: the slot key is what tells them apart. */}
          <AudienzzBanner
            adConfigId="118"
            slotKey="in-content-2"
            placeholderHeight={250}
          />

          <Text style={styles.body}>{LOREM}</Text>
        </ScrollView>
      </SafeAreaView>
    </AudienzzPage>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  backButton: { padding: 16 },
  backText: { fontSize: 16 },
  body: { padding: 16, fontSize: 15, lineHeight: 22 },
});
