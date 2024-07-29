import * as React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Platform,
  StyleSheet,
} from 'react-native';
import RNAudienzz from 'audienzzrn';
import { LOREM } from './constants';
import ErrorHandlingExample from './components/ErrorHandlingExample';
import OriginalBannerAPIExample from './components/OriginalBannerAPIExample';
import OriginalInterstitialAPIExample from './components/OriginalInterstitialAPIExample';
import OriginalRewardedAPIExample from './components/OriginalRewardedAPIExample';
import LazyLoadingExample from './components/LazyLoadingExample';
import RenderingInterstitialAPIExample from './components/RenderingInterstitialAPIExample';
import RenderingRewardedAPIExample from './components/RenderingRewardedAPIExample';
import RenderingBannerAPIExample from './components/RenderingBannerAPIExample';

RNAudienzz()
  .initialize('Company ID provided for the app by Audienzz')
  .then((value) => console.log(JSON.stringify(value, null, 2)));

export default function App() {
  return (
    <SafeAreaView style={styles.flex}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollviewcontentContainerStyle}
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
        <RenderingBannerAPIExample />
        <View style={styles.height30} />

        <RenderingInterstitialAPIExample />
        <View style={styles.height30} />

        <RenderingRewardedAPIExample />

        <Text style={styles.lorem}>{LOREM}</Text>

        <Text style={styles.bigText}>LAZY LOADING PART</Text>
        <LazyLoadingExample />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
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
});
