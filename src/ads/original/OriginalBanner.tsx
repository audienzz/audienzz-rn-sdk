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
import { getCurrentPage, pageKeyOf } from '../../pageRegistry';
import {
  AudienzzPageContext,
  type AudienzzPageContextValue,
} from '../../managed/AudienzzPage';

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

  static contextType = AudienzzPageContext;

  constructor(
    props: OriginalBannerProps,
    context?: AudienzzPageContextValue | null
  ) {
    super(props, context);
    this.nativeComponentRef = createRef();
    // A lazy banner must have a real frame before it loads: the native viewport check that
    // starts its auction bails on 0x0, so a lazy slot hidden until onAdLoaded never loaded at all.
    // Lazy and explicitly reserved banners reserve their first requested size (see render).
    this.state = {
      isBannerVisible: props.isReserved || props.isLazyLoad || false,
    };
    // Inside an <AudienzzPage>, that page owns this slot, whichever banner API is used. Reading
    // the module-global "current page" instead bound every retained tab's banner to whichever tab
    // had been reported most recently, so after a tab switch NONE of them matched the tab they
    // were actually on and the coordinator released them all.
    //
    // Outside a page wrapper this falls back to the page the app last reported, which is the
    // long-standing low-level contract.
    this.pageKey = context?.page
      ? pageKeyOf(context.page)
      : pageKeyOf(getCurrentPage());
  }

  /**
   * The page this banner belongs to. Travels to native as the `pageKey` prop so the page
   * coordinator can match this ad to its screen by value — host identity can't, since every RN ad
   * shares one host.
   *
   * `null` means the app never called `pageImpression` before rendering this
   * ad, which native reports as an integration error.
   */
  private readonly pageKey: string | null;

  /**
   * A page impression is handled ENTIRELY by native for original-API banners:
   * the coordinator releases every banner that isn't on the incoming page and
   * re-auctions the ones that are, in place.
   *
   * The bridge must NOT also remount the native view. An RN banner is a real
   * AdManagerAdView / GAMBannerView in the view hierarchy, so an in-place
   * re-auction repaints on its own; remounting would drop the view, and the
   * replacement's own initial load would fire a SECOND auction, discarding the
   * creative native had just fetched.
   */

  reload = () => {
    const handle = findNodeHandle(this.nativeComponentRef.current);
    if (handle) {
      UIManager.dispatchViewManagerCommand(
        handle,
        UIManager.getViewManagerConfig(ComponentName).Commands
          .reload as number,
        []
      );
    }
  };

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

    // Native fires these with an empty `{ nativeEvent: {} }`; the public callbacks take no argument.
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

    // Until the ad loads, a reserved or lazy banner holds its first requested size, so the native
    // visibility check has a frame to measure; after load, the size Google actually served.
    const reservedSize = this.state.adSize ?? restProps.sizes?.[0];
    const bannerStyle = this.state.isBannerVisible && reservedSize != null
      ? { width: reservedSize.width, height: reservedSize.height }
      : styles.hiddenBanner;

    return (
      <View style={[bannerStyle]}>
        <NativeComponent
          pageKey={this.pageKey}
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
