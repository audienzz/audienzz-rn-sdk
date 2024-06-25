import * as React from 'react';
import {} from 'react-native';
import { OriginalRewarded } from 'audienzzrn';
import { APP_CONTENT_FOR_REWARDED } from '../constants';
import ActionButton from './ActionButton';

const OriginalRewardedAPIExample = () => {
  const [isRewarded, setIsRewarded] = React.useState(false);

  const showRewarded = () => {
    setIsRewarded(true);
  };

  return (
    <>
      <ActionButton labelButton="Rewarded Video" onPress={showRewarded} />
      {isRewarded && (
        <OriginalRewarded
          adUnitID="ca-app-pub-3940256099942544/1712485313"
          auConfigID="prebid-demo-video-rewarded-320-480-original-api"
          onRewardEarned={(event) => {
            console.log(
              `The user received -> ${JSON.stringify(event, null, 2)}`
            );
            setIsRewarded(false);
          }}
          isLazyLoad={false}
          pbAdSlot="pupupipi"
          gpID="kyky"
          keyword="mainKeyword"
          keywords={['clothing', 'sport']}
          appContent={APP_CONTENT_FOR_REWARDED}
          onAdLoaded={() => console.log('REWARDED success')}
          onAdFailedToLoad={(error) => {
            console.log(`REWARDED ERROR -> ${JSON.stringify(error, null, 2)}`);
            setIsRewarded(false);
          }}
        />
      )}
    </>
  );
};

export default OriginalRewardedAPIExample;
