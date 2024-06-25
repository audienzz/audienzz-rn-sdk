import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OriginalInterstitial } from 'audienzzrn';
import ActionButton from './ActionButton';
import { APP_CONTENT_FOR_INTERSTITIAL } from '../constants';
import { getRandomConfigIdInterstitial } from '../utils';

const OriginalInterstitialAPIExample = () => {
  const [isInterstitialBanner, setIsInterstitialBanner] = React.useState(false);
  const [isInterstitialVideo, setIsInterstitialVideo] = React.useState(false);
  const [isInterstitialMulti, setIsInterstitialMulti] = React.useState(false);

  const showInterstitialBanner = () => {
    setIsInterstitialBanner(true);
  };
  const showInterstitialVideo = () => {
    setIsInterstitialVideo(true);
  };
  const showInterstitialMulti = () => {
    setIsInterstitialMulti(true);
  };

  const interstitialMultiformatAuConfigID = getRandomConfigIdInterstitial();

  return (
    <>
      <ActionButton
        labelButton="Interstitial API HTML"
        onPress={showInterstitialBanner}
      />
      <View style={styles.height10} />
      <ActionButton
        labelButton="Interstitial API Multiformat"
        onPress={showInterstitialMulti}
      />
      <View style={styles.height10} />
      <ActionButton
        labelButton="Interstitial API Video"
        onPress={showInterstitialVideo}
      />

      {isInterstitialBanner && (
        <OriginalInterstitial
          // adUnitID="/21808260008/prebid-demo-app-original-api-display-interstitial"
          adUnitID="ca-app-pub-3940256099942544/4411468910"
          auConfigID="prebid-demo-display-interstitial-320-480"
          adFormats={['banner']}
          isLazyLoad={false}
          pbAdSlot="pupupipi"
          gpID="kyky"
          keyword="mainKeyword"
          keywords={['clothing', 'sport']}
          appContent={APP_CONTENT_FOR_INTERSTITIAL}
          onAdLoaded={() => console.log('INTERSTITIAL success')}
          onAdFailedToLoad={(error) => {
            console.log(
              `INTERSTITIAL ERROR -> ${JSON.stringify(error, null, 2)}`
            );
            setIsInterstitialBanner(false);
          }}
        />
      )}
      {isInterstitialVideo && (
        <OriginalInterstitial
          adUnitID="/21808260008/prebid-demo-app-original-api-video-interstitial"
          auConfigID="prebid-demo-video-interstitial-320-480-original-api"
          adFormats={['video']}
          isLazyLoad={false}
        />
      )}
      {isInterstitialMulti && (
        <OriginalInterstitial
          adUnitID="/21808260008/prebid-demo-intestitial-multiformat"
          auConfigID={interstitialMultiformatAuConfigID}
          isLazyLoad={false}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  height10: {
    height: 10,
  },
});

export default OriginalInterstitialAPIExample;
