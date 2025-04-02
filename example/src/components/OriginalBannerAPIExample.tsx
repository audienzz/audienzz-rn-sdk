import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { OriginalBanner } from 'audienzz';
import { APP_CONTENT_FOR_BANNER } from '../constants';
import { getRandomConfigIdBanner } from '../utils';
import ActionButton from './ActionButton';
import { Dimensions } from 'react-native';
import { Platform } from 'react-native';

const OriginalBannerAPIExample = () => {
  const bannerMultiformatAuConfigID = getRandomConfigIdBanner();

  const bannerRef = React.createRef<OriginalBanner>();

  const handleStopAutoRefresh = () => {
    if (bannerRef.current) {
      bannerRef.current.stopAutoRefresh();
    }
  };

  const handleResumeAutoRefresh = () => {
    if (bannerRef.current) {
      bannerRef.current.resumeAutoRefresh();
    }
  };

  return (
    <>
      <View style={styles.border}>
        <Text style={styles.text}>
          Original Banner API HTML 300x250 is a reserved
        </Text>
        <OriginalBanner
          ref={bannerRef}
          adUnitID="/96628199/de_audienzz.ch_v2/de_audienzz.ch_320_adnz_wideboard_1"
          auConfigID="33994718"
          width={300}
          height={250}
          adFormats={['banner']}
          isLazyLoad={false}
          autoRefreshPeriodMillis={30000}
          pbAdSlot="pbAdSlot"
          gpID="gpID"
          keyword="clothing"
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

        <View style={styles.height10} />
        <ActionButton
          labelButton="Stop"
          onPress={handleStopAutoRefresh}
          buttonStyle={styles.buttonStyle}
        />
        <View style={styles.height10} />
        <ActionButton
          labelButton="Resume"
          onPress={handleResumeAutoRefresh}
          buttonStyle={styles.buttonStyle}
        />
      </View>
      <View style={styles.height30} />
      <View style={styles.border}>
        <Text style={styles.text}>
          Original Banner API HTML 320x50 is not reserved
        </Text>
        <OriginalBanner
          adUnitID="ca-app-pub-3940256099942544/2934735716"
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
      <View style={styles.height30} />
      <Text style={styles.text}>Original Banner API Multisize</Text>
      <OriginalBanner
        adUnitID="ca-app-pub-3940256099942544/2435281174"
        auConfigID="prebid-demo-banner-320-50"
        width={Dimensions.get('window').width}
        height={250}        
        adFormats={['banner']}
        isLazyLoad={false}
        onAdFailedToLoad={(error) =>
          console.log(`ERROR -> ${JSON.stringify(error, null, 2)}`)
        }
        isAdaptive={true}
      />
      <View style={styles.height350} />
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
  height350: {
    height: 350,
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
  buttonStyle: { width: '40%' },
});

export default OriginalBannerAPIExample;
