import { Platform, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import {
  OriginalBanner,
  OriginalInterstitial,
  OriginalRewarded,
  RenderingBanner,
  RenderingInterstitial,
  RenderingRewarded,
} from 'audienzzrn';
import {
  getRandomConfigIdBanner,
  getRandomConfigIdInterstitial,
} from '../utils';

const LazyLoadingExample = () => {
  const bannerMultiformatAuConfigID = getRandomConfigIdBanner();
  const interstitialMultiformatAuConfigID = getRandomConfigIdInterstitial();

  return (
    <>
      {Platform.OS === 'ios' ? (
        <>
          <Text style={styles.text}>Original Banner API HTML 300x250</Text>
          <OriginalBanner
            adUnitID="ca-app-pub-3940256099942544/2435281174"
            auConfigID="prebid-demo-banner-300-250"
            width={300}
            height={250}
            adFormats={['banner']}
          />
          <View style={styles.height30} />
          <Text style={styles.text}>Original Banner API HTML 320x50</Text>
          <OriginalBanner
            adUnitID="ca-app-pub-3940256099942544/2435281174"
            auConfigID="prebid-demo-banner-320-50"
            width={320}
            height={50}
            adFormats={['banner']}
          />
          <View style={styles.height30} />
          <Text style={styles.text}>Original Banner API Multiformat</Text>
          <OriginalBanner
            adUnitID="/21808260008/prebid-demo-original-banner-multiformat"
            auConfigID={bannerMultiformatAuConfigID}
            width={300}
            height={250}
          />
          <View style={styles.height30} />
          <Text style={styles.text}>Original Banner API Video</Text>
          <OriginalBanner
            adUnitID="/21808260008/prebid-demo-original-api-video-banner"
            auConfigID="prebid-demo-video-outstream-original-api"
            width={300}
            height={250}
            adFormats={['video']}
          />
          <View style={styles.height30} />
          <Text style={styles.text}>Rendering Banner API HTML 320x50</Text>
          <RenderingBanner
            // adUnitID="/21808260008/prebid_demo_app_original_api_banner"
            adUnitID="/21808260008/prebid_oxb_320x50_banner"
            auConfigID="prebid-demo-banner-320-50"
            width={320}
            height={50}
            adFormat="banner"
            onAdFailedToLoad={(error) =>
              console.log(`ERROR -> ${JSON.stringify(error, null, 2)}`)
            }
            isReserved
          />
          <View style={styles.height30} />
          <Text style={styles.text}>Rendering Banner API Video</Text>
          <RenderingBanner
            // adUnitID="/21808260008/prebid-demo-original-api-video-banner"
            adUnitID="/21808260008/prebid_oxb_300x250_banner"
            // auConfigID="prebid-demo-video-outstream-original-api"
            auConfigID="prebid-demo-video-outstream"
            width={300}
            height={250}
            adFormat="video"
          />

          <View style={styles.height30} />
          <View style={styles.height500} />
          <Text style={styles.text}>Original Interstitial</Text>
          <OriginalInterstitial
            adUnitID="/21808260008/prebid-demo-intestitial-multiformat"
            auConfigID={interstitialMultiformatAuConfigID}
            style={styles.background}
          />

          <View style={styles.height30} />
          <View style={styles.height500} />
          <Text style={styles.text}>Original Rewarded</Text>
          <OriginalRewarded
            adUnitID="ca-app-pub-3940256099942544/1712485313"
            auConfigID="prebid-demo-video-rewarded-320-480-original-api"
            onRewardEarned={(event) => {
              console.log(
                `The user received -> ${JSON.stringify(event, null, 2)}`
              );
            }}
            style={styles.background}
          />

          <View style={styles.height30} />
          <View style={styles.height500} />
          <Text style={styles.text}>Rendering Interstitial</Text>
          <RenderingInterstitial
            adUnitID="/21808260008/prebid_oxb_html_interstitial"
            auConfigID="prebid-demo-display-interstitial-320-480"
            adFormat="banner"
            style={styles.background}
          />

          <View style={styles.height30} />
          <View style={styles.height500} />
          <Text style={styles.text}>Rendering Rewarded</Text>
          <RenderingRewarded
            adUnitID="/21808260008/prebid_oxb_rewarded_video_test"
            // adUnitID="ca-app-pub-3940256099942544/5224354917"
            auConfigID="prebid-demo-video-rewarded-320-480"
            onRewardEarned={() => {
              console.log(
                'The user can receive reward (own implementation) -> 💰'
              );
            }}
            style={styles.background}
          />
        </>
      ) : (
        <>
          <Text>LAZY LOADING not yet implemented</Text>
        </>
      )}
    </>
  );
};

export default LazyLoadingExample;

const styles = StyleSheet.create({
  height30: {
    height: 30,
  },
  text: {
    marginBottom: 3,
    color: '#000',
    fontWeight: '600',
  },
  height500: {
    width: '100%',
    height: 500,
    backgroundColor: 'blue',
  },
  background: {
    backgroundColor: 'yellow',
    width: 10,
    height: 10,
  },
});
