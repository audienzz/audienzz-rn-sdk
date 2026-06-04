// This component is an exact copy of the OriginalView function from App.tsx
// at SDK tag 0.3.8. Used to verify backward compatibility — no smartRefresh
// prop, no prefetchMargin prop, sticky-ad navigation is inlined below.
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
import { LOREM } from '../constants';
import ErrorHandlingExample from './ErrorHandlingExample';
import OriginalBannerAPIExample from './OriginalBannerAPIExample';
import OriginalInterstitialAPIExample from './OriginalInterstitialAPIExample';
import OriginalRewardedAPIExample from './OriginalRewardedAPIExample';
import RenderingInterstitialAPIExample from './RenderingInterstitialAPIExample';
import LazyLoadingExample from './LazyLoadingExample';
import StickyAdExample from './StickyAdExample';

interface Props {
  onBack: () => void;
}

const LegacyOriginalView_v0_3_8: React.FC<Props> = ({ onBack }) => {
  const [showSticky, setShowSticky] = React.useState(false);

  if (showSticky) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => setShowSticky(false)}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <StickyAdExample />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
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
          <Text style={styles.bigText}>STICKY AD</Text>
          <TouchableOpacity style={styles.navButton} onPress={() => setShowSticky(true)}>
            <Text style={styles.navButtonText}>Open Sticky Ad Example →</Text>
          </TouchableOpacity>
          <View style={styles.height30} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
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

export default LegacyOriginalView_v0_3_8;
