import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { OriginalBanner } from 'audienzz';
import { getRandomConfigIdBanner } from '../utils';
import ActionButton from './ActionButton';
import { Dimensions } from 'react-native';

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
          sizes={[{width: 300, height: 250}, {width: 220, height: 80}]}
          adFormats={['banner']}
          isLazyLoad={false}
          autoRefreshPeriodMillis={30000}
          pbAdSlot="pbAdSlot"
          gpID="gpID"
          impOrtbConfig={`{
          "banner": {
            "check": "yeash2222"
          }
        }`}
          onAdLoaded={() =>
            console.log('Original Banner API HTML 300x250 success')
          }
          onAdClicked={() =>
            console.log('Original Banner API HTML 300x250 clicked')
          }
          onAdOpened={() =>
            console.log('Original Banner API HTML 300x250 ad opened')
          }
          onAdClosed={() =>
            console.log('Original Banner API HTML 300x250 ad closed')
          }
          onAdFailedToLoad={(error) =>
            console.log(
              `Original Banner API HTML 300x250 ERROR -> ${JSON.stringify(
                error,
                null,
                2
              )}`
            )
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
          sizes={[{width: 320, height: 50}]}
          impOrtbConfig={`{
          "banner": {
            "check": "true"
          }
        }`}
          adFormats={['banner']}
          isLazyLoad={false}
          autoRefreshPeriodMillis={30000}
          onAdLoaded={() =>
            console.log(' Original Banner API HTML 320x50 success')
          }
          onAdClicked={() =>
            console.log(' Original Banner API HTML 320x50 clicked')
          }
          onAdOpened={() =>
            console.log(' Original Banner API HTML 320x50 opened')
          }
          onAdClosed={() =>
            console.log(' Original Banner API HTML 320x50 closed')
          }
          onAdFailedToLoad={(error) =>
            console.log(
              ` Original Banner API HTML 320x50 ERROR -> ${JSON.stringify(
                error,
                null,
                2
              )}`
            )
          }
        />
      </View>
      <View style={styles.height30} />
      <Text style={styles.text}>Original Banner API Multiformat</Text>
      <OriginalBanner
        adUnitID="/21808260008/prebid-demo-original-banner-multiformat"
        auConfigID={bannerMultiformatAuConfigID}
        sizes={[{width: 300, height: 250}]}
        impOrtbConfig={`{
          "banner": {
            "check": "yeash"
          }
        }`}
        isLazyLoad={false}
        onAdLoaded={() =>
          console.log('Original Banner API Multiformat success')
        }
        onAdClicked={() =>
          console.log('Original Banner API Multiformat clicked')
        }
        onAdOpened={() => console.log('Original Banner API Multiformat opened')}
        onAdClosed={() => console.log('Original Banner API Multiformat closed')}
        onAdFailedToLoad={(error) =>
          console.log(
            `Original Banner API Multiformat ERROR -> ${JSON.stringify(
              error,
              null,
              2
            )}`
          )
        }
      />
      <View style={styles.height30} />
      <Text style={styles.text}>Original Banner API Video</Text>
      <OriginalBanner
        adUnitID="/21808260008/prebid-demo-original-api-video-banner"
        auConfigID="prebid-demo-video-outstream-original-api"
       sizes={[{width: 300, height: 250}]}
        adFormats={['video']}
        isLazyLoad={false}
        impOrtbConfig={`{
          "banner": {
            "check": "true"
          }
        }`}
        onAdLoaded={() => console.log('Original Banner API Video success')}
        onAdClicked={() => console.log('Original Banner API Video clicked')}
        onAdOpened={() => console.log('Original Banner API Video opened')}
        onAdClosed={() => console.log('Original Banner API Video closed')}
        onAdFailedToLoad={(error) =>
          console.log(
            `Original Banner API Video ERROR -> ${JSON.stringify(
              error,
              null,
              2
            )}`
          )
        }
        isReserved
      />
      <View style={styles.height30} />
      <Text style={styles.text}>Original Banner API Multisize</Text>
      <OriginalBanner
        adUnitID="ca-app-pub-3940256099942544/2435281174"
        auConfigID="prebid-demo-banner-320-50"
        sizes={[{width: Dimensions.get('window').width, height: 250}]}
        adFormats={['banner']}
        isLazyLoad={false}
        impOrtbConfig={`{
          "banner": {
            "check": "true"
          }
        }`}
        onAdLoaded={() => console.log('Original Banner API Multisize success')}
        onAdClicked={() => console.log('Original Banner API Multisize clicked')}
        onAdOpened={() => console.log('Original Banner API Multisize opened')}
        onAdClosed={() => console.log('Original Banner API Multisize closed')}
        onAdFailedToLoad={(error) =>
          console.log(
            `Original Banner API Multisize ERROR -> ${JSON.stringify(
              error,
              null,
              2
            )}`
          )
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
