import * as React from 'react';
import { ScrollView, Text, TouchableOpacity, View, Platform, StyleSheet } from 'react-native';
import RNAudienzz from 'audienzz';
import { LOREM } from './constants';
import ErrorHandlingExample from './components/ErrorHandlingExample';
import OriginalBannerAPIExample from './components/OriginalBannerAPIExample';
import OriginalInterstitialAPIExample from './components/OriginalInterstitialAPIExample';
import OriginalRewardedAPIExample from './components/OriginalRewardedAPIExample';
import LazyLoadingExample from './components/LazyLoadingExample';
import RenderingInterstitialAPIExample from './components/RenderingInterstitialAPIExample';
import StickyAdExample from './components/StickyAdExample';
import RNTargeting from '../../src/RNTargeting';

RNAudienzz()
  .initialize('Company ID provided for the app by Audienzz')
  .then((value) => console.log(JSON.stringify(value, null, 2)))
  .then((_) => {
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
  });

export default function App() {
  const [screen, setScreen] = React.useState<'main' | 'sticky'>('main');

  if (screen === 'sticky') {
    return (
      <View style={styles.mainContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => setScreen('main')}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <StickyAdExample />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.mainContainer}
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
        <TouchableOpacity style={styles.navButton} onPress={() => setScreen('sticky')}>
          <Text style={styles.navButtonText}>Open Sticky Ad Example →</Text>
        </TouchableOpacity>
        <View style={styles.height30} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
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
