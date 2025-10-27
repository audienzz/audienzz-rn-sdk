import * as React from 'react';
import {} from 'react-native';
import { OriginalRewarded } from 'audienzz';
import ActionButton from './ActionButton';
import { ADS } from '../ads_constants';

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
          adUnitID={ADS.REWARDED_ORIGINAL_API.adUnitID}
          auConfigID={ADS.REWARDED_ORIGINAL_API.auConfigID}
          isLazyLoad={false}
          pbAdSlot="pbAdSlot"
          gpID="gpID"
          impOrtbConfig={`{
          "banner": {
            "check": "true"
          }
        }`}
          onAdLoaded={() => console.log('REWARDED success')}
          onAdFailedToLoad={(error) => {
            console.log(`REWARDED ERROR -> ${JSON.stringify(error, null, 2)}`);
            setIsRewarded(false);
          }}
          onAdClicked={() => console.log('REWARDED clicked')}
          onAdOpened={() => console.log('REWARDED ad opened')}
          onAdClosed={(event) => {
            console.log('REWARDED ad closed');
            console.log(
              `The user received -> ${JSON.stringify(event, null, 2)}`
            );
            setIsRewarded(false);
          }}
        />
      )}
    </>
  );
};

export default OriginalRewardedAPIExample;
