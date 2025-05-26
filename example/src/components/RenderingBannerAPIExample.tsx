import React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { RenderingBanner } from 'audienzz';

const RenderingBannerAPIExample = () => {
  return (
    <>
      <View style={styles.border}>
        <Text style={styles.text}>
          Rendering Banner API HTML 320x50 is a reserved
        </Text>
        <RenderingBanner
          adUnitID={
            Platform.OS === 'android'
              ? 'ca-app-pub-3940256099942544/2934735716'
              : '/21808260008/prebid_oxb_320x50_banner'
          }
          auConfigID="prebid-demo-banner-320-50"
          width={320}
          height={50}
          adFormat="banner"
          isLazyLoad={false}
          pbAdSlot="pbAdSlot"
          gpID="gpID"
          onAdLoaded={() => console.log('success')}
          onAdClicked={() => console.log('clicked')}
          onAdOpened={() => console.log('ad opened')}
          onAdClosed={() => console.log('ad closed')}
          onAdFailedToLoad={(error) =>
            console.log(`ERROR -> ${JSON.stringify(error, null, 2)}`)
          }
          isReserved
        />
      </View>
      <View style={styles.height30} />
      <Text style={styles.text}>
        Rendering Banner API Video is not reserved
      </Text>
      <RenderingBanner
        adUnitID="/21808260008/prebid_oxb_300x250_banner"
        auConfigID="prebid-demo-video-outstream"
        width={300}
        height={250}
        adFormat="video"
        isLazyLoad={false}
      />
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
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'red',
  },
});

export default RenderingBannerAPIExample;
