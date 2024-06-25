import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { OriginalBanner } from 'audienzzrn';
import { APP_CONTENT_FOR_BANNER } from '../constants';
import { getRandomConfigIdBanner } from '../utils';

const OriginalBannerAPIExample = () => {
  const bannerMultiformatAuConfigID = getRandomConfigIdBanner();

  return (
    <>
      <View style={styles.border}>
        <Text style={styles.text}>
          Original Banner API HTML 300x250 is a reserved
        </Text>
        <OriginalBanner
          adUnitID="ca-app-pub-3940256099942544/2435281174"
          auConfigID="prebid-demo-banner-300-250"
          width={300}
          height={250}
          adFormats={['banner']}
          isLazyLoad={false}
          autoRefreshPeriodMillis={30000}
          pbAdSlot="pupupipi"
          gpID="kyky"
          keywords={['clothing', 'sport']}
          appContent={APP_CONTENT_FOR_BANNER}
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
      <View style={styles.border}>
        <Text style={styles.text}>
          Original Banner API HTML 320x50 is not reserved
        </Text>
        <OriginalBanner
          adUnitID="/21808260008/prebid_demo_app_original_api_banner"
          auConfigID="prebid-demo-banner-320-50"
          width={320}
          height={50}
          adFormats={['banner']}
          isLazyLoad={false}
          autoRefreshPeriodMillis={30000}
          onAdFailedToLoad={(error) =>
            console.log(`ERROR -> ${JSON.stringify(error, null, 2)}`)
          }
        />
      </View>
      <View style={styles.height30} />
      <Text style={styles.text}>Original Banner API Multiformat</Text>
      <OriginalBanner
        adUnitID="/21808260008/prebid-demo-original-banner-multiformat"
        // adUnitID="ca-app-pub-3940256099942544/2934735716"
        auConfigID={bannerMultiformatAuConfigID}
        width={300}
        height={250}
        isLazyLoad={false}
        onAdFailedToLoad={(error) =>
          console.log(`ERROR -> ${JSON.stringify(error, null, 2)}`)
        }
      />
      <View style={styles.height30} />
      <Text style={styles.text}>Original Banner API Video</Text>
      <OriginalBanner
        adUnitID="/21808260008/prebid-demo-original-api-video-banner"
        auConfigID="prebid-demo-video-outstream-original-api"
        width={300}
        height={250}
        adFormats={['video']}
        isLazyLoad={false}
        onAdFailedToLoad={(error) =>
          console.log(`ERROR -> ${JSON.stringify(error, null, 2)}`)
        }
        isReserved
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

export default OriginalBannerAPIExample;
