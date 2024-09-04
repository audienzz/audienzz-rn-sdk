import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OriginalInterstitial } from 'audienzz';
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
          adUnitID="ca-app-pub-3940256099942544/4411468910"
          auConfigID="prebid-demo-display-interstitial-320-480"
          adFormats={['banner']}
          isLazyLoad={false}
          pbAdSlot="pbAdSlot"
          gpID="gpID"
          keyword="mainKeyword"
          keywords={['clothing', 'sport']}
          appContent={APP_CONTENT_FOR_INTERSTITIAL}
          onAdLoaded={() => console.log('INTERSTITIAL success')}
          onAdClicked={() => console.log('INTERSTITIAL clicked')}
          onAdOpened={() => console.log('INTERSTITIAL ad opened')}
          onAdClosed={() => {
            console.log('INTERSTITIAL ad closed');
            setIsInterstitialBanner(false);
          }}
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
          adUnitID="ca-app-pub-3940256099942544/5135589807"
          auConfigID="prebid-demo-video-interstitial-320-480-original-api"
          adFormats={['video']}
          isLazyLoad={false}
          onAdClosed={() => {
            console.log('INTERSTITIAL ad closed');
            setIsInterstitialVideo(false);
          }}
        />
      )}
      {isInterstitialMulti && (
        <OriginalInterstitial
          adUnitID="/21808260008/prebid-demo-intestitial-multiformat"
          auConfigID={interstitialMultiformatAuConfigID}
          isLazyLoad={false}
          onAdClosed={() => {
            console.log('INTERSTITIAL ad closed');
            setIsInterstitialMulti(false);
          }}
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
