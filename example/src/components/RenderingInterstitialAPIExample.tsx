import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RenderingInterstitial } from 'audienzz';
import ActionButton from './ActionButton';

const RenderingInterstitialAPIExample = () => {
  const [isInterstitialBanner, setIsInterstitialBanner] = React.useState(false);
  const [isInterstitialVideo, setIsInterstitialVideo] = React.useState(false);

  const showInterstitialBanner = () => {
    setIsInterstitialBanner(true);
  };
  const showInterstitialVideo = () => {
    setIsInterstitialVideo(true);
  };

  return (
    <>
      <ActionButton
        labelButton="Rendering Interstitial HTML"
        onPress={showInterstitialBanner}
      />
      <View style={styles.height10} />
      <ActionButton
        labelButton="Rendering Interstitial Video"
        onPress={showInterstitialVideo}
      />

      {isInterstitialBanner && (
        <RenderingInterstitial
          adUnitID="/21808260008/prebid_oxb_html_interstitial"
          auConfigID="prebid-demo-display-interstitial-320-480"
          adFormat="banner"
          isLazyLoad={false}
          onAdLoaded={() => console.log('onAdLoaded')}
          onAdFailedToLoad={(error) => {
            console.log(JSON.stringify(error, null, 2));
            setIsInterstitialBanner(false);
          }}
          onAdClicked={() => console.log('onAdClicked')}
          onAdOpened={() => console.log('onAdOpened')}
          onAdClosed={() => {
            console.log('onAdClosed');
            setIsInterstitialBanner(false);
          }}
        />
      )}
      {isInterstitialVideo && (
        <RenderingInterstitial
          adUnitID="/21808260008/prebid_oxb_interstitial_video"
          auConfigID="prebid-demo-video-interstitial-320-480"
          adFormat="video"
          isLazyLoad={false}
          onAdFailedToLoad={(error) => {
            console.log(JSON.stringify(error, null, 2));
            setIsInterstitialVideo(false);
          }}
          onAdClosed={() => {
            console.log('onAdClosed');
            setIsInterstitialVideo(false);
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

export default RenderingInterstitialAPIExample;
