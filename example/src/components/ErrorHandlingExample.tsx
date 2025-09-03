import React from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import {
  OriginalBanner,
  OriginalInterstitial,
  OriginalRewarded,
} from 'audienzz';
import ActionButton from './ActionButton';

const ErrorHandlingExample = () => {
  const [isInterstitialError, setIsInterstitialError] = React.useState(false);
  const [isRewardedError, setIsRewardedError] = React.useState(false);

  const triggerInterstitialError = () => {
    setIsInterstitialError(true);
  };
  const triggerRewardedError = () => {
    setIsRewardedError(true);
  };

  return (
    <>
      <View style={styles.border}>
        <Text style={styles.text}>Banner 320x50 100% ERROR is a reserved</Text>
        <OriginalBanner
          adUnitID="/21808260008/prebid_demo_app_original_api_banne"
          auConfigID="prebid-demo-banner-320-50"
          sizes={[{width: 320, height: 50}]}
          adFormats={['banner']}
          isLazyLoad={false}
          isReserved
        />
      </View>
      <View style={styles.height30} />
      <View style={styles.border}>
        <Text style={styles.text}>
          Banner 320x50 100% ERROR is not reserved
        </Text>
        <OriginalBanner
          adUnitID="/21808260008/prebid_demo_app_original_api_banne"
          auConfigID="prebid-demo-banner-320-50"
          sizes={[{width: 320, height: 50}]}
          adFormats={['banner']}
          isLazyLoad={false}
        />
      </View>
      <View style={styles.height30} />
      <ActionButton
        labelButton="Interstitial 100% ERROR"
        onPress={triggerInterstitialError}
      />
      <View style={styles.height10} />
      <ActionButton
        labelButton="Rewarded 100% ERROR"
        onPress={triggerRewardedError}
      />

      {isInterstitialError && (
        <OriginalInterstitial
          adUnitID="/21808260008/prebid-demo-app-original-api-display-interstitia"
          auConfigID="prebid-demo-display-interstitial-320-480"
          adFormats={['banner']}
          isLazyLoad={false}
          onAdLoaded={() => console.log('INTERSTITIAL success')}
          onAdFailedToLoad={(error) => {
            console.log(
              `INTERSTITIAL ERROR -> ${JSON.stringify(error, null, 2)}`
            );

            Alert.alert('Test Error Handling', `${error.message}`, [
              { text: 'OK', onPress: () => {} },
            ]);
            setIsInterstitialError(false);
          }}
        />
      )}
      {isRewardedError && (
        <OriginalRewarded
          adUnitID="ca-app-pub-3940256099942544/171248531"
          auConfigID="prebid-demo-video-rewarded-320-480-original-api"
          isLazyLoad={false}
          onAdLoaded={() => console.log('REWARDED success')}
          onAdFailedToLoad={(error) => {
            console.log(`REWARDED ERROR -> ${JSON.stringify(error, null, 2)}`);
            Alert.alert('Test Error Handling', `${error.message}`, [
              { text: 'OK', onPress: () => {} },
            ]);
            setIsRewardedError(false);
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
  height30: {
    height: 30,
  },
  text: {
    marginBottom: 3,
    color: '#000',
    fontWeight: '600',
  },
  border: {
    marginHorizontal: 10,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'red',
  },
});

export default ErrorHandlingExample;
