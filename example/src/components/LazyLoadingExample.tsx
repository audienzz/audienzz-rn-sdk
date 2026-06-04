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
import ActionButton from './ActionButton';

const LazyLoadingExample = () => {
  const interstitialMultiformatAuConfigID = getRandomConfigIdInterstitial();

  const [showInterstitialHtml, setShowInterstitialHtml] = React.useState(false);
  const [showInterstitialVideo, setShowInterstitialVideo] = React.useState(false);
  const [showInterstitialMulti, setShowInterstitialMulti] = React.useState(false);
  const [showRewarded, setShowRewarded] = React.useState(false);

  return (
    <>
      <Text style={styles.text}>Original Banner API HTML 300x250</Text>
      <OriginalBanner
        adUnitId="/96628199/de_audienzz.ch_v2/multi-size"
        auConfigId="wuobgeuc"
        sizes={[{width: 300, height: 250}]}
        adFormats={['banner']}
      />
      <View style={styles.height30} />
      <Text style={styles.text}>Original Banner API HTML 320x50</Text>
      <OriginalBanner
        adUnitId="/96628199/de_audienzz.ch_v2/multi-size"
        auConfigId="wuobgeuc"
        sizes={[{width: 320, height: 50}]}
        adFormats={['banner']}
      />
      <View style={styles.height30} />
      <Text style={styles.text}>Original Banner API Multiformat</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
      <View style={styles.height30} />
      <Text style={styles.text}>Original Banner API Video</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
      <View style={styles.height30} />
      <Text style={styles.text}>Rendering Banner API HTML 320x50</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
      <View style={styles.height30} />
      <Text style={styles.text}>Rendering Banner API Video</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>

      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />

      <Text style={styles.text}>Original Interstitial HTML</Text>
      <ActionButton
        labelButton="Show Interstitial HTML"
        onPress={() => setShowInterstitialHtml(true)}
      />
      {showInterstitialHtml && (
        <OriginalInterstitial
          adUnitId="/96628199/de_audienzz.ch_v2/multi-size"
          auConfigId="37116627"
          adFormats={['banner']}
          onAdClosed={() => setShowInterstitialHtml(false)}
          onAdFailedToLoad={() => setShowInterstitialHtml(false)}
        />
      )}

      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />

      <Text style={styles.text}>Original Interstitial Video</Text>
      <ActionButton
        labelButton="Show Interstitial Video"
        onPress={() => setShowInterstitialVideo(true)}
      />
      {showInterstitialVideo && (
        <OriginalInterstitial
          adUnitId="/96628199/de_audienzz.ch_v2/multi-size"
          auConfigId="37116627"
          adFormats={['video']}
          onAdClosed={() => setShowInterstitialVideo(false)}
          onAdFailedToLoad={() => setShowInterstitialVideo(false)}
        />
      )}

      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />

      <Text style={styles.text}>Original Interstitial Multiformat</Text>
      <ActionButton
        labelButton="Show Interstitial Multiformat"
        onPress={() => setShowInterstitialMulti(true)}
      />
      {showInterstitialMulti && (
        <OriginalInterstitial
          adUnitId="/96628199/de_audienzz.ch_v2/multi-size"
          auConfigId={interstitialMultiformatAuConfigID}
          onAdClosed={() => setShowInterstitialMulti(false)}
          onAdFailedToLoad={() => setShowInterstitialMulti(false)}
        />
      )}

      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />

      <Text style={styles.text}>Original Rewarded</Text>
      <ActionButton
        labelButton="Show Rewarded"
        onPress={() => setShowRewarded(true)}
      />
      {showRewarded && (
        <OriginalRewarded
          adUnitId="/96628199/de_audienzz.ch_v2/multi-size"
          auConfigId="37116627"
          onUserEarnedReward={(reward) => {
            console.log(`The user received -> ${JSON.stringify(reward, null, 2)}`);
          }}
          onAdClosed={() => setShowRewarded(false)}
          onAdFailedToLoad={() => setShowRewarded(false)}
        />
      )}

      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />
      <Text style={styles.text}>Rendering Interstitial Banner</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />
      <Text style={styles.text}>Rendering Interstitial Video</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
      <View style={styles.height30} />
      <View style={styles.height300} />
      <View style={styles.height30} />
      <Text style={styles.text}>Rendering Rewarded</Text>
      <Text style={styles.text}>Will be implemented in next version</Text>
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
