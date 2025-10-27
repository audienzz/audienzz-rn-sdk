import React from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import {
  OriginalBanner,
  OriginalInterstitial,
  OriginalRewarded,
} from 'audienzz';
import ActionButton from './ActionButton';
import { ADS } from '../ads_constants';

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
          adUnitID={ADS.BANNER_RESERVED_DEMO.adUnitID}
          auConfigID={ADS.BANNER_RESERVED_DEMO.auConfigID}
          sizes={ADS.BANNER_RESERVED_DEMO.sizes}
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
          adUnitID={ADS.BANNER_RESERVED_DEMO.adUnitID}
          auConfigID={ADS.BANNER_RESERVED_DEMO.auConfigID}
          sizes={ADS.BANNER_RESERVED_DEMO.sizes}
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
          adUnitID={ADS.INTERSTITIAL_DEMO.adUnitID}
          auConfigID={ADS.INTERSTITIAL_DEMO.auConfigID}
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
          adUnitID={ADS.REWARDED_DEMO.adUnitID}
          auConfigID={ADS.REWARDED_DEMO.auConfigID}
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
