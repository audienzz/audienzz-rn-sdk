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

import React, { Component } from 'react';
import {
  requireNativeComponent,
  UIManager,
  View,
  StyleSheet,
} from 'react-native';
import type { RenderingBannerProps, AdError, AdSize } from '../../types';
import { LINKING_ERROR } from '../../constants';

const ComponentName = 'RCTRenderingBannerView';
const NativeComponent = requireNativeComponent<any>(ComponentName);

interface RenderingBannerState {
  isBannerVisible: boolean;
  adSize?: AdSize;
}

export class RenderingBanner extends Component<
  RenderingBannerProps,
  RenderingBannerState
> {
  constructor(props: RenderingBannerProps) {
    super(props);
    this.state = {
      isBannerVisible: props.isReserved ?? false,
    };
  }

  render() {
    const {
      adUnitId,
      auConfigId,
      gpId,
      playbackMethod = ['AutoPlaySoundOn'],
      isLazyLoad = true,
      apiParameters = ['MRAID_2'],
      videoProtocols = ['VAST_2_0'],
      videoPlacement = 'inBanner',
      videoBitrate = [300, 1500],
      videoDuration = [5, 30],
      ...restProps
    } = this.props;

    if (UIManager.getViewManagerConfig(ComponentName) == null) {
      throw new Error(LINKING_ERROR);
    }

    const handleAdLoaded = (event: AdSize | { nativeEvent: { width: number; height: number } }) => {
      const adSize: AdSize =
        'nativeEvent' in event ? event.nativeEvent : event;

      console.log("Adsize", adSize);

      this.setState({ isBannerVisible: true, adSize: adSize });
      this.props.onAdLoaded?.(adSize);
    };

    const handleAdFailedToLoad = (
      event: AdError | { nativeEvent: { code: number; message: string } }
    ) => {
      const error: AdError =
        'nativeEvent' in event ? event.nativeEvent : event;
      this.setState({ isBannerVisible: false });
      this.props.onAdFailedToLoad?.(error);
    };

    const bannerStyle = this.state.isBannerVisible
      ? { width: this.state.adSize?.width, height: this.state.adSize?.height }
      : styles.hiddenBanner;

    return (
      <View style={[bannerStyle]}>
        <NativeComponent
          {...restProps}
          adUnitID={adUnitId}
          auConfigID={auConfigId}
          gpID={gpId}
          playbackMethod={playbackMethod}
          isLazyLoad={isLazyLoad}
          apiParameters={apiParameters}
          videoProtocols={videoProtocols}
          videoPlacement={videoPlacement}
          videoBitrate={videoBitrate}
          videoDuration={videoDuration}
          onAdLoaded={handleAdLoaded}
          onAdFailedToLoad={handleAdFailedToLoad}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  hiddenBanner: {
    width: 0,
    height: 0,
    overflow: 'hidden',
  },
});
