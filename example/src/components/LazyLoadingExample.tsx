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
        adUnitId="/96628199/de_audienzz.ch_v2/de_audienzz.ch_320_adnz_wideboard_1"
        auConfigId="33994718"
        sizes={[{width: 300, height: 250}]}
        adFormats={['banner']}
      />
      <View style={styles.height30} />
      <Text style={styles.text}>Original Banner API HTML 320x50</Text>
      <OriginalBanner
        adUnitId="ca-app-pub-3940256099942544/2934735716"
        auConfigId="prebid-demo-banner-320-50"
        sizes={[{width: 320, height: 50}]}
        adFormats={['banner']}
      />
      <View style={styles.height30} />
      <Text style={styles.text}>Original Banner API Multiformat</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
      {/* <OriginalBanner
        adUnitId="/21808260008/prebid-demo-original-banner-multiformat"
        auConfigId={bannerMultiformatAuConfigID}
        width={300}
        height={250}
      /> */}
      <View style={styles.height30} />
      <Text style={styles.text}>Original Banner API Video</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
      {/* <OriginalBanner
        adUnitId="/21808260008/prebid-demo-original-api-video-banner"
        auConfigId="prebid-demo-video-outstream-original-api"
        width={300}
        height={250}
        adFormats={['video']}
      /> */}
      <View style={styles.height30} />
      <Text style={styles.text}>Rendering Banner API HTML 320x50</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
      {/* <RenderingBanner
        adUnitId={
          Platform.OS === 'android'
            ? 'ca-app-pub-3940256099942544/2934735716'
            : '/21808260008/prebid_oxb_320x50_banner'
        }
        auConfigId="prebid-demo-banner-320-50"
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
        adUnitId="/21808260008/prebid_oxb_300x250_banner"
        auConfigId="prebid-demo-video-outstream"
        width={300}
        height={250}
        adFormat="video"
      /> */}

      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />
      <Text style={styles.text}>Original Interstitial HTML</Text>
      <OriginalInterstitial
        adUnitId="ca-app-pub-3940256099942544/4411468910"
        auConfigId="prebid-demo-display-interstitial-320-480"
        adFormats={['banner']}
      />
      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />
      <Text style={styles.text}>Original Interstitial Video</Text>
      <OriginalInterstitial
        adUnitId="ca-app-pub-3940256099942544/5135589807"
        auConfigId="prebid-demo-video-interstitial-320-480-original-api"
        adFormats={['video']}
      />
      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />
      <Text style={styles.text}>Original Interstitial Multiformat</Text>
      <OriginalInterstitial
        adUnitId="/96628199/de_audienzz.ch_v2/de_audienzz.ch_320_adnz_wideboard_1"
        auConfigId={interstitialMultiformatAuConfigID}
      />
      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />
      <Text style={styles.text}>Original Rewarded</Text>
      <OriginalRewarded
        adUnitId="ca-app-pub-3940256099942544/1712485313"
        auConfigId="prebid-demo-video-rewarded-320-480-original-api"
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
        adUnitId="/21808260008/prebid_oxb_html_interstitial"
        auConfigId="prebid-demo-display-interstitial-320-480"
        adFormat="banner"
      /> */}
      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />
      <Text style={styles.text}>Rendering Interstitial Video</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
      {/* <RenderingInterstitial
        adUnitId="/21808260008/prebid_oxb_interstitial_video"
        auConfigId="prebid-demo-video-interstitial-320-480"
        adFormat="video"
      /> */}
      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />
      <Text style={styles.text}>Rendering Rewarded</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
      {/* <RenderingRewarded
        adUnitId="/21808260008/prebid-demo-app-original-api-video-interstitial"
        auConfigId="prebid-demo-video-rewarded-320-480"
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
