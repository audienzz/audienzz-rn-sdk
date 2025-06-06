import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import {
  OriginalBanner,
  OriginalInterstitial,
  OriginalRewarded,
} from 'audienzz';
import {
  getRandomConfigIdInterstitial,
} from '../utils';

const LazyLoadingExample = () => {
  const interstitialMultiformatAuConfigID = getRandomConfigIdInterstitial();

  return (
    <>
      <Text style={styles.text}>Original Banner API HTML 300x250</Text>
      <OriginalBanner
        adUnitID="/96628199/de_audienzz.ch_v2/de_audienzz.ch_320_adnz_wideboard_1"
        auConfigID="33994718"
        width={300}
        height={250}
        adFormats={['banner']}
      />
      <View style={styles.height30} />
      <Text style={styles.text}>Original Banner API HTML 320x50</Text>
      <OriginalBanner
        adUnitID="ca-app-pub-3940256099942544/2934735716"
        auConfigID="prebid-demo-banner-320-50"
        width={320}
        height={50}
        adFormats={['banner']}
      />
      <View style={styles.height30} />
      <Text style={styles.text}>Original Banner API Multiformat</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
      {/* <OriginalBanner
        adUnitID="/21808260008/prebid-demo-original-banner-multiformat"
        auConfigID={bannerMultiformatAuConfigID}
        width={300}
        height={250}
      /> */}
      <View style={styles.height30} />
      <Text style={styles.text}>Original Banner API Video</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
      {/* <OriginalBanner
        adUnitID="/21808260008/prebid-demo-original-api-video-banner"
        auConfigID="prebid-demo-video-outstream-original-api"
        width={300}
        height={250}
        adFormats={['video']}
      /> */}
      <View style={styles.height30} />
      <Text style={styles.text}>Rendering Banner API HTML 320x50</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
      {/* <RenderingBanner
        adUnitID={
          Platform.OS === 'android'
            ? 'ca-app-pub-3940256099942544/2934735716'
            : '/21808260008/prebid_oxb_320x50_banner'
        }
        auConfigID="prebid-demo-banner-320-50"
        width={320}
        height={50}
        adFormat="banner"
        onAdFailedToLoad={(error) =>
          console.log(`ERROR -> ${JSON.stringify(error, null, 2)}`)
        }
        isReserved
      /> */}
      <View style={styles.height30} />
      <Text style={styles.text}>Rendering Banner API Video</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
      {/* <RenderingBanner
        adUnitID="/21808260008/prebid_oxb_300x250_banner"
        auConfigID="prebid-demo-video-outstream"
        width={300}
        height={250}
        adFormat="video"
      /> */}

      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />
      <Text style={styles.text}>Original Interstitial HTML</Text>
      <OriginalInterstitial
        adUnitID="ca-app-pub-3940256099942544/4411468910"
        auConfigID="prebid-demo-display-interstitial-320-480"
        adFormats={['banner']}
      />
      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />
      <Text style={styles.text}>Original Interstitial Video</Text>
      <OriginalInterstitial
        adUnitID="ca-app-pub-3940256099942544/5135589807"
        auConfigID="prebid-demo-video-interstitial-320-480-original-api"
        adFormats={['video']}
      />
      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />
      <Text style={styles.text}>Original Interstitial Multiformat</Text>
      <OriginalInterstitial
        adUnitID="/96628199/de_audienzz.ch_v2/de_audienzz.ch_320_adnz_wideboard_1"
        auConfigID={interstitialMultiformatAuConfigID}
      />
      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />
      <Text style={styles.text}>Original Rewarded</Text>
      <OriginalRewarded
        adUnitID="ca-app-pub-3940256099942544/1712485313"
        auConfigID="prebid-demo-video-rewarded-320-480-original-api"
        onAdClosed={(event) => {
          console.log(`The user received -> ${JSON.stringify(event, null, 2)}`);
        }}
      />
      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />
      <Text style={styles.text}>Rendering Interstitial Banner</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
      {/* <RenderingInterstitial
        adUnitID="/21808260008/prebid_oxb_html_interstitial"
        auConfigID="prebid-demo-display-interstitial-320-480"
        adFormat="banner"
      /> */}
      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />
      <Text style={styles.text}>Rendering Interstitial Video</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
      {/* <RenderingInterstitial
        adUnitID="/21808260008/prebid_oxb_interstitial_video"
        auConfigID="prebid-demo-video-interstitial-320-480"
        adFormat="video"
      /> */}
      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />
      <Text style={styles.text}>Rendering Rewarded</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
      {/* <RenderingRewarded
        adUnitID="/21808260008/prebid-demo-app-original-api-video-interstitial"
        auConfigID="prebid-demo-video-rewarded-320-480"
        onAdClosed={() => {
          console.log('The user can receive reward (own implementation) -> 💰');
        }}
      /> */}
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
  height300: {
    width: '100%',
    height: 300,
    backgroundColor: 'blue',
  },
});
