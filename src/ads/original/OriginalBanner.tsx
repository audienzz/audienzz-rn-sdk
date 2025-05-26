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

import React, { Component, createRef } from 'react';
import {
  requireNativeComponent,
  UIManager,
  findNodeHandle,
  View,
  StyleSheet,
} from 'react-native';
import type { IOriginalBannerProps, TAdError } from '../../types';
import { LINKING_ERROR } from '../../constants';

const ComponentName = 'RCTOriginalBannerView';
const NativeComponent =
  requireNativeComponent<IOriginalBannerProps>(ComponentName);

interface IOriginalBannerState {
  isBannerVisible: boolean;
}

export class OriginalBanner extends Component<
  IOriginalBannerProps,
  IOriginalBannerState
> {
  private nativeComponentRef: React.RefObject<any>;

  constructor(props: IOriginalBannerProps) {
    super(props);
    this.nativeComponentRef = createRef();
    this.state = {
      isBannerVisible: props.isReserved ?? false,
    };
  }

  stopAutoRefresh = () => {
    const handle = findNodeHandle(this.nativeComponentRef.current);
    if (handle) {
      UIManager.dispatchViewManagerCommand(
        handle,
        UIManager.getViewManagerConfig(ComponentName).Commands
          .stopAutoRefresh as number,
        []
      );
    }
  };

  resumeAutoRefresh = () => {
    const handle = findNodeHandle(this.nativeComponentRef.current);
    if (handle) {
      UIManager.dispatchViewManagerCommand(
        handle,
        UIManager.getViewManagerConfig(ComponentName).Commands
          .resumeAutoRefresh as number,
        []
      );
    }
  };

  render() {
    const {
      playbackMethod = ['AutoPlaySoundOn'],
      isLazyLoad = true,
      isAdaptive = false,
      adFormats = ['banner', 'video'],
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

    const handleAdLoaded = () => {
      this.setState({ isBannerVisible: true });
      this.props.onAdLoaded?.();
    };

    const handleAdFailedToLoad = (
      event: TAdError | { nativeEvent: { code: number; message: string } }
    ) => {
      const error: TAdError =
        'nativeEvent' in event ? event.nativeEvent : event;
      this.setState({ isBannerVisible: false });
      this.props.onAdFailedToLoad?.(error);
    };

    const bannerStyle = this.state.isBannerVisible
      ? { width: this.props.width, height: this.props.height }
      : styles.hiddenBanner;

    return (
      <View style={[bannerStyle]}>
        <NativeComponent
          {...restProps}
          ref={this.nativeComponentRef}
          playbackMethod={playbackMethod}
          isLazyLoad={isLazyLoad}
          isAdaptive={isAdaptive}
          adFormats={adFormats}
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
