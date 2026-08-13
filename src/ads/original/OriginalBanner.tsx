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
import type { OriginalBannerProps, AdError, AdSize } from '../../types';
import { LINKING_ERROR } from '../../constants';

const ComponentName = 'RCTOriginalBannerView';
const NativeComponent = requireNativeComponent<any>(ComponentName);

interface OriginalBannerState {
  isBannerVisible: boolean;
  adSize?: AdSize;
}

export class OriginalBanner extends Component<
  OriginalBannerProps,
  OriginalBannerState
> {
  private nativeComponentRef: React.RefObject<any>;

  constructor(props: OriginalBannerProps) {
    super(props);
    this.nativeComponentRef = createRef();
    // H7: when lazy loading, the container must reserve space up front. The native visibility
    // check that triggers the deferred fetch bails on a 0x0 frame — so a banner hidden until
    // onAdLoaded (which never fires because it's never visible) is a permanently dead slot.
    // Reserve the first requested size for lazy or explicitly-reserved banners.
    this.state = {
      isBannerVisible: props.isReserved || props.isLazyLoad || false,
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
      adUnitId,
      auConfigId,
      gpId,
      refreshTimeMillis,
      smartRefresh = false,
      playbackMethod = ['AutoPlaySoundOn'],
      isLazyLoad = false,
      prefetchMargin = 200,
      isAdaptive = false,
      adFormats = ['banner', 'video'],
      apiParameters = ['MRAID_1', 'MRAID_2', 'MRAID_3', 'OMID_1'],
      videoProtocols = ['VAST_2_0'],
      videoPlacement = 'inBanner',
      videoBitrate = [300, 1500],
      videoDuration = [5, 30],
      onAdClicked,
      onAdOpened,
      onAdClosed,
      ...restProps
    } = this.props;

    if (UIManager.getViewManagerConfig(ComponentName) == null) {
      throw new Error(LINKING_ERROR);
    }

    // M7: native fires these with an empty `{ nativeEvent: {} }` payload. Unwrap them so the
    // public callbacks match their no-arg AdEvents signature, consistent with onAdLoaded/
    // onAdFailedToLoad below (which are already unwrapped).
    const handleAdClicked = () => onAdClicked?.();
    const handleAdOpened = () => onAdOpened?.();
    const handleAdClosed = () => onAdClosed?.();

    const handleAdLoaded = (event: AdSize | { nativeEvent: { width: number; height: number } }) => {
      const adSize: AdSize =
        'nativeEvent' in event ? event.nativeEvent : event;

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

    // Before the ad loads, fall back to the first requested size as a placeholder so a reserved/
    // lazy banner has a non-zero frame for the native visibility check (H7). After load, use the
    // real returned ad size.
    const placeholderSize = restProps.sizes?.[0];
    const reservedSize = this.state.adSize ?? placeholderSize;
    const bannerStyle =
      this.state.isBannerVisible && reservedSize != null
        ? { width: reservedSize.width, height: reservedSize.height }
        : styles.hiddenBanner;

    return (
      <View style={[bannerStyle]}>
        <NativeComponent
          {...restProps}
          adUnitID={adUnitId}
          auConfigID={auConfigId}
          gpID={gpId}
          autoRefreshPeriodMillis={refreshTimeMillis}
          style={styles.nativeComponent}
          ref={this.nativeComponentRef}
          isLazyLoad={isLazyLoad}
          smartRefresh={smartRefresh}
          prefetchMargin={prefetchMargin}
          isAdaptive={isAdaptive}
          playbackMethod={playbackMethod}
          adFormats={adFormats}
          apiParameters={apiParameters}
          videoProtocols={videoProtocols}
          videoPlacement={videoPlacement}
          videoBitrate={videoBitrate}
          videoDuration={videoDuration}
          onAdLoaded={handleAdLoaded}
          onAdFailedToLoad={handleAdFailedToLoad}
          onAdClicked={handleAdClicked}
          onAdOpened={handleAdOpened}
          onAdClosed={handleAdClosed}
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
  nativeComponent: {
    width: '100%',
    height: '100%',
  },
});
