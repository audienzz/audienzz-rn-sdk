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
  findNodeHandle,
  View,
  StyleSheet,
} from 'react-native';
import type { RenderingBannerProps, AdError, AdSize } from '../../types';
import { LINKING_ERROR } from '../../constants';
import {
  getCurrentPage,
  pageKeyOf,
  subscribe as subscribeToPage,
  unsubscribe as unsubscribeFromPage,
} from '../../pageRegistry';

const ComponentName = 'RCTRenderingBannerView';
const NativeComponent = requireNativeComponent<any>(ComponentName);

interface RenderingBannerState {
  viewEpoch?: number;
  isPageActive: boolean;
  isBannerVisible: boolean;
  adSize?: AdSize;
}

export class RenderingBanner extends Component<
  RenderingBannerProps,
  RenderingBannerState
> {
  private nativeRef: any;

  constructor(props: RenderingBannerProps) {
    super(props);
    this.state = {
      viewEpoch: 0,
      isPageActive: true,
      isBannerVisible: props.isReserved ?? false,
    };
  }

  /**
   * The page that was current when this banner mounted.
   *
   * Rendering-API banners are NOT tracked by the native page coordinator — it
   * only knows about original-API banners (AudienzzAdViewHandler /
   * AUBannerView). So page ownership for them is enforced here instead: the
   * native view is unmounted while another page is active, which tears the
   * rendering ad down, and remounted when this page returns, which builds a
   * fresh one. Without this a rendering banner would keep refreshing on a
   * screen the user has left — the exact leak page-scoping exists to stop.
   *
   * A `null` pageKey means the app never called `pageImpression`; such a banner
   * stays permanently active, preserving behaviour for apps that don't use page
   * impressions.
   */
  private readonly page = getCurrentPage();
  private readonly pageKey = pageKeyOf(this.page);

  onPageImpression = (page: string, epoch: number) => {
    if (this.pageKey == null) {
      return;
    }
    if (page === this.pageKey) {
      this.setState({ isPageActive: true, viewEpoch: epoch });
    } else {
      this.setState({ isPageActive: false });
    }
  };

  componentDidMount() {
    subscribeToPage(this.onPageImpression);
  }

  componentWillUnmount() {
    unsubscribeFromPage(this.onPageImpression);
  }

  /**
   * Reload this banner (fresh auction). Broadcast target for
   * Audienzz.pageImpression; the native command self-filters by visibility.
   * The rendering API has no in-place reload, so the native side tears down and
   * rebuilds the ad view.
   */
  reload = () => {
    const handle = findNodeHandle(this.nativeRef);
    if (handle == null) {
      return;
    }
    UIManager.dispatchViewManagerCommand(
      handle,
      // @ts-ignore
      UIManager.getViewManagerConfig(ComponentName).Commands.reload,
      []
    );
  };

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

    // Unmounting the native view while another page is active IS the release for
    // a rendering banner — see `pageKey`. The slot keeps its layout box so the
    // page doesn't reflow when the ad comes back.
    if (!this.state.isPageActive) {
      return <View style={[bannerStyle]} />;
    }

    return (
      <View style={[bannerStyle]}>
        <NativeComponent
          key={`audienzz-ad-${this.state.viewEpoch ?? 0}`}
          {...restProps}
          ref={(ref: any) => {
            this.nativeRef = ref;
          }}
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
