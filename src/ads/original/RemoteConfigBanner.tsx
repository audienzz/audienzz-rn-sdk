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
} from 'react-native';
import type { RemoteConfigBannerProps } from '../../types';

const COMPONENT_NAME = 'RNRemoteConfigBanner';

const RNRemoteConfigBannerView =
    requireNativeComponent<RemoteConfigBannerProps>(COMPONENT_NAME);

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
export class RemoteConfigBanner extends Component<RemoteConfigBannerProps, { height?: number }> {
    private nativeRef: any;

    state = {
        height: undefined,
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
        const { style, onAdLoaded, ...otherProps } = this.props;
        const dynamicStyle = this.state.height ? { height: this.state.height } : {};

        return (
            <RNRemoteConfigBannerView
                {...otherProps}
                style={[style, dynamicStyle]}
                onAdLoaded={this._onAdLoaded}
                ref={(ref) => {
                    this.nativeRef = ref;
                }}
            />
        );
    }
}
