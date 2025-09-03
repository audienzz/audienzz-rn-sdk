import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OriginalInterstitial } from 'audienzz';
import ActionButton from './ActionButton';
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
          adUnitID="/96628199/de_audienzz.ch_v2/de_audienzz.ch_320_adnz_wideboard_1"
          auConfigID="34400101"
          adFormats={['banner']}
          isLazyLoad={false}
          sizes={[{width: 333, height: 333}, {width: 444, height: 444}]}
          pbAdSlot="pbAdSlot"
          gpID="gpID"
          onAdLoaded={() => console.log('INTERSTITIAL HTML loaded')}
          onAdClicked={() => console.log('INTERSTITIAL HTML clicked')}
          onAdOpened={() => console.log('INTERSTITIAL HTML opened')}
          onAdClosed={() => {
            console.log('INTERSTITIAL HTML closed');
            setIsInterstitialBanner(false);
          }}
          onAdFailedToLoad={(error) => {
            console.log(
              `INTERSTITIAL HTML ERROR -> ${JSON.stringify(error, null, 2)}`
            );
            setIsInterstitialBanner(false);
          }}
        />
      )}
      {isInterstitialVideo && (
        <OriginalInterstitial
          adUnitID="/96628199/de_audienzz.ch_v2/de_audienzz.ch_320_adnz_wideboard_1"
          auConfigID="34400101"
          adFormats={['video']}
          isLazyLoad={false}
          impOrtbConfig={`{
          "banner": {
            "check": "true"
          }
        }`}
          onAdLoaded={() => console.log('INTERSTITIAL VIDEO loaded')}
          onAdClicked={() => console.log('INTERSTITIAL VIDEO clicked')}
          onAdOpened={() => console.log('INTERSTITIAL VIDEO opened')}
          onAdClosed={() => {
            console.log('INTERSTITIAL VIDEO closed');
            setIsInterstitialVideo(false);
          }}
          onAdFailedToLoad={(error) => {
            console.log(
              `INTERSTITIAL VIDEO ERROR -> ${JSON.stringify(error, null, 2)}`
            );
            setIsInterstitialVideo(false);
          }}
        />
      )}
      {isInterstitialMulti && (
        <OriginalInterstitial
          adUnitID="/96628199/de_audienzz.ch_v2/de_audienzz.ch_320_adnz_wideboard_1"
          auConfigID={interstitialMultiformatAuConfigID}
          isLazyLoad={false}
          impOrtbConfig={`{
          "banner": {
            "check": "true"
          }
        }`}
          onAdLoaded={() => console.log('INTERSTITIAL MULTI loaded')}
          onAdClicked={() => console.log('INTERSTITIAL MULTI clicked')}
          onAdOpened={() => console.log('INTERSTITIAL MULTI opened')}
          onAdClosed={() => {
            console.log('INTERSTITIAL MULTI closed');
            setIsInterstitialMulti(false);
          }}
          onAdFailedToLoad={(error) => {
            console.log(
              `INTERSTITIAL MULTI ERROR -> ${JSON.stringify(error, null, 2)}`
            );
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
