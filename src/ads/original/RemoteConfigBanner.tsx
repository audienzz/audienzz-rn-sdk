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
    StyleSheet as RNStyleSheet,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import type { RemoteConfigBannerProps } from '../../types';
import { getCurrentPage, pageKeyOf } from '../../pageRegistry';

const COMPONENT_NAME = 'RNRemoteConfigBanner';

type NativeRemoteConfigBannerProps = RemoteConfigBannerProps & {
    adWidth?: number;
    adHeight?: number;
    /** Route key this ad belongs to; see `pageRegistry`. */
    pageKey?: string | null;
};

const RNRemoteConfigBannerView =
    requireNativeComponent<NativeRemoteConfigBannerProps>(COMPONENT_NAME);

/**
 * RemoteConfigBanner component for displaying banner ads configured via backend API.
 * 
 * Publishers only need to provide an adConfigId - all GAM and Prebid configuration
 * is automatically fetched from the server.
 * 
 * @example
 * ```tsx
 * <RemoteConfigBanner
 *   adConfigId="118"
 *   style={{ width: '100%', height: 250 }}
 *   onAdLoaded={() => console.log('Banner loaded')}
 *   onAdFailedToLoad={(error) => console.log('Failed:', error)}
 * />
 * ```
 */
export class RemoteConfigBanner extends Component<
    RemoteConfigBannerProps,
    { height?: number }
> {
    private nativeRef: any;

    state = {
        height: undefined,
    };

    /**
     * The page that was current when this banner mounted. Travels to native as
     * the `pageKey` prop so the page coordinator can match this ad to its
     * screen by value — host identity can't, since every RN ad shares one host.
     */
    private readonly page = getCurrentPage();

    /**
     * Reload this banner (fresh auction). Broadcast target for
     * Audienzz.pageImpression; the native command self-filters by visibility.
     */
    reload = () => {
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.nativeRef),
            // @ts-ignore
            UIManager.getViewManagerConfig(COMPONENT_NAME).Commands.reload,
            []
        );
    };

    /**
     * Stops auto-refresh for this banner ad
     */
    stopAutoRefresh = () => {
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.nativeRef),
            // @ts-ignore
            UIManager.getViewManagerConfig(COMPONENT_NAME).Commands.stopAutoRefresh,
            []
        );
    };

    /**
     * Resumes auto-refresh for this banner ad
     */
    /**
     * Report a cover the SDK cannot infer — a pointer-transparent veil, a painted overlay.
     * Current state, not an event: call it with `false` when the cover goes away. Independent of
     * `stopAutoRefresh`: clearing one does not clear the other.
     */
    setCovered = (covered: boolean) => {
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.nativeRef),
            // @ts-ignore
            UIManager.getViewManagerConfig(COMPONENT_NAME).Commands.setCovered,
            [covered]
        );
    };

    resumeAutoRefresh = () => {
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.nativeRef),
            // @ts-ignore
            UIManager.getViewManagerConfig(COMPONENT_NAME).Commands.resumeAutoRefresh,
            []
        );
    };

    _onAdLoaded = (event: any) => {
        const { height } = event.nativeEvent;
        if (height && height !== this.state.height) {
            this.setState({ height });
        }

        if (this.props.onAdLoaded) {
            this.props.onAdLoaded(event.nativeEvent);
        }
    };

    render() {
        const { style, onAdLoaded, onAdFailedToLoad, ...otherProps } = this.props;
        const dynamicStyle = this.state.height ? { height: this.state.height } : {};
        const flattenedStyle = RNStyleSheet.flatten(style) as ViewStyle | undefined;
        const adWidth = typeof flattenedStyle?.width === 'number' ? flattenedStyle.width : undefined;
        const adHeight = typeof flattenedStyle?.height === 'number' ? flattenedStyle.height : undefined;
        const nativeStyle = adHeight
            ? styles.fixedNativeComponent
            : styles.adaptiveNativeComponent;

        return (
            <View style={[style, dynamicStyle]}>
                <RNRemoteConfigBannerView
                    pageKey={this.props.pageKey ?? pageKeyOf(this.page) ?? undefined}
                    {...otherProps}
                    adWidth={adWidth}
                    adHeight={adHeight}
                    style={nativeStyle}
                    onAdLoaded={this._onAdLoaded}
                    onAdFailedToLoad={onAdFailedToLoad}
                    ref={(ref) => {
                        this.nativeRef = ref;
                    }}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    fixedNativeComponent: {
        width: '100%',
        height: '100%',
    },
    adaptiveNativeComponent: {
        width: '100%',
        minHeight: 50,
    },
});
