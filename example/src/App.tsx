import * as React from 'react';
import { ScrollView, Text, View, Platform, StyleSheet } from 'react-native';
import RNAudienzz from 'audienzz';
import { RNTargeting } from 'audienzz';
import { LOREM } from './constants';
import ErrorHandlingExample from './components/ErrorHandlingExample';
import OriginalBannerAPIExample from './components/OriginalBannerAPIExample';
import OriginalInterstitialAPIExample from './components/OriginalInterstitialAPIExample';
import OriginalRewardedAPIExample from './components/OriginalRewardedAPIExample';
import LazyLoadingExample from './components/LazyLoadingExample';
import RenderingInterstitialAPIExample from './components/RenderingInterstitialAPIExample';
import RemoteConfigExample from './components/RemoteConfigExample';

const REMOTE_CONFIG_ENABLED = true;
const REMOTE_CONFIG_URL = 'https://dev-api.adnz.co/api/ws-sdk-config/public/v1';
const PUBLISHER_ID = '81';

export default function App() {
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    if (REMOTE_CONFIG_ENABLED) {
      RNAudienzz()
        .initializeRemote(
          REMOTE_CONFIG_URL,
          PUBLISHER_ID
        )
        .then((value) => {
          console.log('[SDK] Initialized with remote config:', JSON.stringify(value, null, 2));
          RNTargeting().addGlobalTargeting('TEST', '1');
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
          setInitialized(true);
        });
    }
  }, []);

  if (!initialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Initializing SDK...</Text>
      </View>
    );
  }

  return REMOTE_CONFIG_ENABLED ? RemoteView() : OriginalView();
}

function RemoteView() {
  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.mainContainer}
        contentContainerStyle={styles.scrollviewcontentContainerStyle}
      >
        <Text style={styles.bigText}>REMOTE CONFIG</Text>
        <RemoteConfigExample />
        <View style={styles.height30} />
      </ScrollView>
    </View>
  );
}

function OriginalView() {
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
