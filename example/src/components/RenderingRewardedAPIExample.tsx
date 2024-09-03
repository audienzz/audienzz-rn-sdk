import * as React from 'react';
import {} from 'react-native';
import { RenderingRewarded } from 'audienzz';
import ActionButton from './ActionButton';
import { APP_CONTENT_FOR_REWARDED } from '../constants';

const RenderingRewardedAPIExample = () => {
  const [isRewarded, setIsRewarded] = React.useState(false);

  const showRewarded = () => {
    setIsRewarded(true);
  };

  return (
    <>
      <ActionButton
        labelButton="Rendering Rewarded Video"
        onPress={showRewarded}
      />

      {isRewarded && (
        <RenderingRewarded
          adUnitID="/21808260008/prebid-demo-app-original-api-video-interstitial"
          auConfigID="prebid-demo-video-rewarded-320-480"
          isLazyLoad={false}
          onAdLoaded={() => console.log('REWARDED onAdLoaded')}
          onAdClicked={() => console.log('REWARDED onAdClicked')}
          onAdClosed={() => {
            console.log('REWARDED onAdClosed');
            console.log(
              'The user can receive reward (own implementation) -> 💰'
            );
            setIsRewarded(false);
          }}
          onAdOpened={() => console.log('REWARDED onAdOpened')}
          onAdFailedToLoad={(error) => {
            console.log(`REWARDED ERROR -> ${JSON.stringify(error, null, 2)}`);
            setIsRewarded(false);
          }}
          appContent={APP_CONTENT_FOR_REWARDED}
        />
      )}
    </>
  );
};

export default RenderingRewardedAPIExample;
