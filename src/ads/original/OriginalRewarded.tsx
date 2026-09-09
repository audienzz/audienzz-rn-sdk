/*
    Copyright 2025 Audienzz AG

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

*/

import React from 'react';
import { requireNativeComponent, UIManager } from 'react-native';
import type {
  OriginalRewardedProps,
  AdError,
  RewardEarnedEvent,
} from '../../types';
import { LINKING_ERROR } from '../../constants';

const ComponentName = 'RCTOriginalRewardedView';
const NativeComponent = requireNativeComponent<any>(ComponentName);

// NOTE: rewarded ads auto-present as soon as they load — there is no imperative `show()`.
// (The previous `show()` ref handle dispatched to a command that the view manager never
// implemented, so it silently did nothing.) Use `onAdLoaded` to know the ad is showing,
// `onUserEarnedReward` for the reward, and `onAdFailedToShow` to detect a burned bid.
export const OriginalRewarded = (props: OriginalRewardedProps) => {
  const {
    adUnitId,
    auConfigId,
    gpId,
    playbackMethod = ['AutoPlaySoundOn'],
    isLazyLoad = true,
    apiParameters = ['MRAID_2'],
    videoProtocols = ['VAST_2_0'],
    videoBitrate = [300, 1500],
    videoDuration = [5, 30],
    onUserEarnedReward,
    onAdClosed,
    onAdFailedToLoad,
    onAdFailedToShow,
    ...restProps
  } = props;

  if (UIManager.getViewManagerConfig(ComponentName) == null) {
    throw new Error(LINKING_ERROR);
  }

  // Native fires a single onAdClosed event carrying the reward payload.
  // We split it here: reward data → onUserEarnedReward, close signal → onAdClosed.
  const handleAdClosed = (
    event:
      | RewardEarnedEvent
      | { nativeEvent: { type: string; amount: number } }
  ) => {
    const rewardEvent = 'nativeEvent' in event ? event.nativeEvent : event;
    onUserEarnedReward?.(rewardEvent);
    onAdClosed?.();
  };

  const handleAdFailedToLoad = (
    event: AdError | { nativeEvent: { code: number; message: string } }
  ) => {
    const error: AdError = 'nativeEvent' in event ? event.nativeEvent : event;
    onAdFailedToLoad?.(error);
  };

  const handleAdFailedToShow = (
    event: AdError | { nativeEvent: { code: number; message: string } }
  ) => {
    const error: AdError = 'nativeEvent' in event ? event.nativeEvent : event;
    onAdFailedToShow?.(error);
  };

  return (
    <NativeComponent
      {...restProps}
      adUnitID={adUnitId}
      auConfigID={auConfigId}
      gpID={gpId}
      playbackMethod={playbackMethod}
      isLazyLoad={isLazyLoad}
      apiParameters={apiParameters}
      videoProtocols={videoProtocols}
      videoBitrate={videoBitrate}
      videoDuration={videoDuration}
      onAdClosed={handleAdClosed}
      onAdFailedToLoad={handleAdFailedToLoad}
      onAdFailedToShow={handleAdFailedToShow}
    />
  );
};
