# Audienzz React Native SDK

**Audienzz React Native SDK** is a React Native wrapper around the native Android/iOS Audienzz SDKs (Original and Rendering APIs).

## Installation

### Package manager

The easiest way to install is use your package manager:

```sh
npm install audienzz

or

yarn add audienzz
```

### IOS Platform

An additional step to install native modules for an IOS project:

```sh
cd ios && pod install && cd ..

```

## Setup

The Audienzz SDK works in conjunction with the [Google Mobile Ads](https://developers.google.com/admob), and for correct work, the following settings are required.

### Android Setup

Add your AdMob app ID, [as identified in the AdMob web interface](https://support.google.com/admob/answer/7356431), to your app's `AndroidManifest.xml` file. To do so, add a <meta-data> tag with android:name="com.google.android.gms.ads.APPLICATION_ID". You can find your app ID in the AdMob web interface. For android:value, insert your own AdMob app ID, surrounded by quotation marks.

```js
<manifest>
  <application>
    <!-- Sample AdMob app ID: ca-app-pub-3940256099942544~3347511713 -->
    <meta-data
        android:name="com.google.android.gms.ads.APPLICATION_ID"
        android:value="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"/>
  </application>
</manifest>
```

In a real app, replace the sample app ID with your **_*actual AdMob app ID*_**. You can use the sample ID if you're just experimenting with the SDK in a Hello World app.

### iOS Setup

Update your app's `Info.plist` file to add three keys:

- To display the [App Tracking Transparency](https://developers.google.com/admob/ios/privacy/strategies#request) authorization request for accessing the IDFA, add the NSUserTrackingUsageDescription key with a custom message describing your usage.
- A GADApplicationIdentifier key with a string value of your AdMob app ID [found in the AdMob UI](https://support.google.com/admob/answer/7356431).
- A SKAdNetworkItems key with SKAdNetworkIdentifier values for Google (cstr6suwn9.skadnetwork) and [select third-party buyers](https://developers.google.com/admob/ios/3p-skadnetworks) who have provided these values to Google.

<details>
  <summary>Complete snippet</summary>

```js
<key>NSUserTrackingUsageDescription</key>
<string>This identifier will be used to deliver personalized ads to you.</string>
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-3940256099942544~1458002511</string>
<key>SKAdNetworkItems</key>
<array>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>cstr6suwn9.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>4fzdc2evr5.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>4pfyvq9l8r.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>2fnua5tdw4.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>ydx93a7ass.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>5a6flpkh64.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>p78axxw29g.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>v72qych5uu.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>ludvb6z3bs.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>cp8zw746q7.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>3sh42y64q3.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>c6k4g5qg8m.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>s39g8k73mm.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>3qy4746246.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>f38h382jlk.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>hs6bdukanm.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>v4nxqhlyqp.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>wzmmz9fp6w.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>yclnxrl5pm.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>t38b2kh725.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>7ug5zh24hu.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>gta9lk7p23.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>vutu7akeur.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>y5ghdn5j9k.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>n6fk4nfna4.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>v9wttpbfk9.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>n38lu8286q.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>47vhws6wlr.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>kbd757ywx3.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>9t245vhmpl.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>eh6m2bh4zr.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>a2p9lx4jpn.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>22mmun2rn5.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>4468km3ulz.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>2u9pt9hc89.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>8s468mfl3y.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>klf5c3l5u5.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>ppxm28t8ap.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>ecpz2srf59.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>uw77j35x4d.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>pwa73g5rt2.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>mlmmfzh3r3.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>578prtvx9j.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>4dzt52r2t5.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>e5fvkxwrpn.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>8c4e2ghe7u.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>zq492l623r.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>3rd42ekr43.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>3qcr597p9d.skadnetwork</string>
  </dict>
</array>
```

</details>

<br/>

In a real app, replace the sample app ID with your **_actual AdMob app ID_**. You can use the sample ID if you're just experimenting with the SDK in a Hello World app.

<!-- **NOTE**: Learn more about native -> [Android](https://developers.google.com/admob/android/quick-start) / [iOS](https://developers.google.com/admob/ios/quick-start) settings. -->

## Usage

### Initialize the Audienzz React Native SDK

Before loading and displaying ads, initialize the Audienzz React Native SDK. This needs to be done only once, ideally at app launch. Automatic Ppid could be enabled or disabled.

```js
import RNAudienzz from 'audienzz';

RNAudienzz()
  .initialize('Company ID provided for the app by Audienzz', false) // Open-Ended Question
  .then((value) => console.log(JSON.stringify(value, null, 2)));
```

------------------------------------
| Method                   | Parameters             | Description                                                                                                                              |
|--------------------------|------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `isAutomaticPpidEnabled` |                        | Used to get current status of automatic PPID usage (if true - PPID is generated and used with all requests, if false - PPID is not used) |
| `setAutomaticPpidEnabled` |  `enablePpid: Boolean` | Used to enable or disable automatic PPID usage                                                                                           |
| `getPpid`                |                        | Used to obtain current PPID if automaticPpid is enabled                                                                                  |
| `setSchainObject`        | `schain: string`       | Method used to set Schain object for all ad requests.                                                                                    |

### Displaying Ads

The Audienzz React Native SDK allows you to display three types Ads - `Banner`, `Interstitial` and `Rewarded`.

#### Original API

<details>
<summary><span>Components example:</span></summary>

```jsx
import React from 'react';
import {
  OriginalBanner,
  OriginalInterstitial,
  OriginalRewarded,
  AdSizes,
} from 'audienzz';

    const bannerRef = React.createRef<OriginalBanner>();

    const handleStopAutoRefresh = () => {
      if (bannerRef.current) {
        bannerRef.current.stopAutoRefresh();
      }
    };

    const handleResumeAutoRefresh = () => {
      if (bannerRef.current) {
        bannerRef.current.resumeAutoRefresh();
      }
    };


    <OriginalBanner
      ref={bannerRef}
      adUnitID="adUnitID"
      auConfigID="auConfigID"
      sizes={[AdSizes.MEDIUM_RECTANGLE]}
      adFormats={['banner']}
      isLazyLoad={false}
      autoRefreshPeriodMillis={30000}
      onAdLoaded={(size) => console.log('success', size)}
      onAdClicked={() => console.log('clicked')}
      onAdOpened={() => console.log('ad opened')}
      onAdClosed={() => console.log('ad closed')}
      onAdFailedToLoad={(error) => console.log(`ERROR -> ${JSON.stringify(error, null, 2)}`)}
      isReserved
    />

   ...

    <OriginalInterstitial
      adUnitID="adUnitID"
      auConfigID="auConfigID"
      adFormats={['video']}
      isLazyLoad={false}
      onAdLoaded={() => console.log('INTERSTITIAL success')}
      onAdFailedToLoad={(error) => console.log(`INTERSTITIAL ERROR -> ${JSON.stringify(error, null, 2)}`)}
    />

   ...

    <OriginalRewarded
      adUnitID="adUnitID"
      auConfigID="auConfigID"
      onAdLoaded={() => console.log('REWARDED success')}
      onAdClosed={(event) => {
        console.log('REWARDED ad closed');
        console.log(`The user received -> ${JSON.stringify(event, null, 2)}`);
      }}
      onAdFailedToLoad={(error) => console.log(`REWARDED ERROR -> ${JSON.stringify(error, null, 2)}`)}
    />

```

</details>

<details>
 <summary><span>Props:</span></summary>

| Name                      | Description                                                                                                                                                                                                                                                                                                                                   | Required | Type                                                                                                                                                                                                                          | For the type Ad                                              |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `adUnitID`                | An ID identifies your banner in the system. You should have a valid, active placement ID to monetize your app.                                                                                                                                                                                                                                | **YES**  | string                                                                                                                                                                                                                        | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `auConfigID`              | An ID of the Stored Impression on the Audienzz Server.                                                                                                                                                                                                                                                                                        | **YES**  | string                                                                                                                                                                                                                        | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `sizes`                   | Array of ad sizes that will be used in the bid request.                                                                                                                                                                                                                                                                              | **YES**  | AdSize[]                                                                                                                                                                                                                        | `OriginalBanner`                                             |
| `isLazyLoad`              | The property that controls when an ad request will be made (tracks the viewport). **Default:** `true`.                                                                                                                                                                                                                                        |    No    | boolean                                                                                                                                                                                                                       | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `pbAdSlot`                | PB Ad Slot is an identifier tied to the placement the ad will be delivered in. The use case for PB Ad Slot is to pass to exchange an ID they can use to tie to reporting systems or use for data science driven model building to match with impressions sourced from alternate integrations. A common ID to pass is the ad server slot name. |    No    | string                                                                                                                                                                                                                        | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `gpID`                    | The Global Placement ID (GPID) is a key that uniquely identifies a specific instance of an adunit.                                                                                                                                                                                                                                            |    No    | string                                                                                                                                                                                                                        | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `impOrtbConfig`                    | The property is used to supply ad request with a custom ORTB configuration that would be merged with imp field in request.                                                                                                                                                                                                                                            |    No    | string                                                                                                                                                                                                                         | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `apiParameters`           | The property is dedicated to adding values for API Frameworks to a bid response according to the OpenRTB 2.5 spec. **Default:** `['MRAID_2']`.                                                                                                                                                                                                |    No    | Array<'MRAID_1' &#124; 'MRAID_2' &#124; 'MRAID_3' &#124; 'VPAID_1' &#124; 'VPAID_2' &#124; 'OMID_1' &#124; 'ORMMA'>                                                                                                           | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `videoProtocols`          | Array or enum of OpenRTB 2.5 supported Protocols. **Default:** `['VAST_2_0']`.                                                                                                                                                                                                                                                                |    No    | Array<'VAST_1_0' &#124; 'VAST_2_0' &#124; 'VAST_3_0' &#124; 'VAST_4_0' &#124; 'DAAST_1_0' &#124; 'VAST_1_0_Wrapped' &#124; 'VAST_2_0_Wrapped' &#124; 'VAST_3_0_Wrapped' &#124; 'VAST_4_0_Wrapped' &#124; 'DAAST_1_0_Wrapped'> | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `videoDuration`           | A property representing the OpenRTB 2.5 video ad duration in seconds. **Default:** `[5, 30]` // [min, max].                                                                                                                                                                                                                                   |    No    | [number, number]                                                                                                                                                                                                              | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `videoBitrate`            | The property representing the OpenRTB 2.5 bit rate in Kbps. **Default:** `[300, 1500]` // [min, max].                                                                                                                                                                                                                                         |    No    | [number, number]                                                                                                                                                                                                              | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `playbackMethod`          | Array of OpenRTB 2.5 playback methods. Only one method is typically used in practice. It is strongly advised to use only the first element of the array. **Default:** `['AutoPlaySoundOn']`.                                                                                                                                                  |    No    | Array<'AutoPlaySoundOn' &#124; 'AutoPlaySoundOff' &#124; 'ClickToPlay' &#124; 'MouseOver' &#124; 'EnterSoundOn' &#124; 'EnterSoundOff'>                                                                                       | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `adFormats`               | This ad unit formats for the current ad unit. **Default:** (Multiformat) `['banner', 'video']`.                                                                                                                                                                                                                                               |    No    | Array<'banner' &#124; 'video'>                                                                                                                                                                                                | `OriginalBanner`, `OriginalInterstitial`                     |
| `videoPlacement`          | OpenRTB 2.5 Placement Type for the auction. **Default:** `'inBanner'`.                                                                                                                                                                                                                                                                        |    No    | 'inBanner' &#124; 'inArticle' &#124; 'inFeed' &#124; 'interstitial'                                                                                                                                                           | `OriginalBanner`                                             |
| `isReserved`              | The property that can be used to determine how the banner will appear. With or without reserved space. _Note: May be useful if the ad will be used where there is a lot of static content._ **Default:** `false`.                                                                                                                             |    No    | boolean                                                                                                                                                                                                                       | `OriginalBanner`                                             |
| `isAdaptive`              | The property that can be used to work with multiply size banner. **Default:** `false`.                                                                                                                             |    No    | boolean                                                                                                                                                                                                                       | `OriginalBanner`                                             |
| `autoRefreshPeriodMillis` | Number defining the refresh time in milliseconds. The value cannot be less than 30000ms. To stop or renew auto refresh, use the `stopAutoRefresh` and `resumeAutoRefresh` methods.                                                                                                                                                            |    No    | number                                                                                                                                                                                                                        | `OriginalBanner`                                             |
| `minSizesPercentage`      | Optional parameter to specify the minimum width/height percent an ad may occupy of a device’s screen. **Default:** `[80, 60]` // [width, height].                                                                                                                                                                                             |    No    | [number, number]                                                                                                                                                                                                              | `OriginalInterstitial`                                       |
| `onAdLoaded`              | A callback triggered when an ad is received.                                                                                                                                                                                                                                                                                                  |    No    | onAdLoaded?(size: AdSize): void                                                                                                                                                                                                           | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `onAdFailedToLoad`        | A callback triggered when an ad request failed.                                                                                                                                                                                                                                                                                               |    No    | onAdFailedToLoad?(error: AdError): void                                                                                                                                                               | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `onAdClicked`             | A callback triggered when a click is recorded for an ad.                                                                                                                                                                                                                                                                                      |    No    | onAdClicked?(): void                                                                                                                                                                                                          | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `onAdOpened`              | A callback triggered when an ad opens an overlay that covers the screen.                                                                                                                                                                                                                                                                      |    No    | onAdOpened?(): void                                                                                                                                                                                                           | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `onAdClosed`              | A callback triggered when the user is about to return to the app. **NOTE:** For `OriginalRewarded`, there is a parameter that contains information about the reward received when interacting with ads.                                                                                                                                       |    No    | onAdClosed?(): void &#124;&#124; onAdClosed?(reward: RewardEarnedEvent): void                                                                                                                                    | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |

</details>

#### Rendering API

<details>
<summary><span>Components example:</span></summary>

```jsx
import React from 'react';
import {
  RenderingBanner,
  RenderingInterstitial,
  RenderingRewarded,
} from 'audienzz';

    <RenderingBanner
      adUnitID="adUnitID"
      auConfigID="auConfigID"
      width={300}
      height={250}
      adFormat="banner"
      isLazyLoad={false}
      onAdLoaded={() => console.log('success')}
      onAdClicked={() => console.log('clicked')}
      onAdOpened={() => console.log('ad opened')}
      onAdClosed={() => console.log('ad closed')}
      onAdFailedToLoad={(error) => console.log(`ERROR -> ${JSON.stringify(error, null, 2)}`)}
      isReserved
    />

   ...

    <RenderingInterstitial
      adUnitID="adUnitID"
      auConfigID="auConfigID"
      adFormat="video"
      onAdLoaded={() => console.log('INTERSTITIAL success')}
      onAdFailedToLoad={(error) => console.log(`INTERSTITIAL ERROR -> ${JSON.stringify(error, null, 2)}`)}
    />

   ...

    <RenderingRewarded
      adUnitID="adUnitID"
      auConfigID="auConfigID"
      onAdLoaded={() => console.log('REWARDED success')}
      onAdClosed={() => {
        console.log('REWARDED ad closed');
        console.log('The user can receive reward (own implementation) -> 💰');
      }}
      onAdFailedToLoad={(error) => console.log(`REWARDED ERROR -> ${JSON.stringify(error, null, 2)}`)}
    />

```

</details>

<details>
 <summary><span>Props:</span></summary>

| Name                 | Description                                                                                                                                                                                                                                                                                                                                   | Required | Type                                                            | For the type Ad                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | --------------------------------------------------------------- | --------------------------------------------------------------- |
| `adUnitID`           | An ID identifies your banner in the system. You should have a valid, active placement ID to monetize your app.                                                                                                                                                                                                                                | **YES**  | string                                                          | `RenderingBanner`, `RenderingInterstitial`, `RenderingRewarded` |
| `auConfigID`         | An ID of the Stored Impression on the Audienzz Server.                                                                                                                                                                                                                                                                                        | **YES**  | string                                                          | `RenderingBanner`, `RenderingInterstitial`, `RenderingRewarded` |
| `width`              | The width of the ad unit which will be used in the bid request.                                                                                                                                                                                                                                                                               | **YES**  | number                                                          | `RenderingBanner`                                               |
| `height`             | The height of the ad unit which will be used in the bid request.                                                                                                                                                                                                                                                                              | **YES**  | number                                                          | `RenderingBanner`                                               |
| `adFormat`           | This ad unit format for the current ad unit.                                                                                                                                                                                                                                                                                                  | **YES**  | 'banner' &#124; 'video'                                         | `RenderingBanner`, `RenderingInterstitial`                      |
| `isLazyLoad`         | The property that controls when an ad request will be made (tracks the viewport). **Default:** `true`.                                                                                                                                                                                                                                        |    No    | boolean                                                         | `RenderingBanner`, `RenderingInterstitial`, `RenderingRewarded` |
| `pbAdSlot`           | PB Ad Slot is an identifier tied to the placement the ad will be delivered in. The use case for PB Ad Slot is to pass to exchange an ID they can use to tie to reporting systems or use for data science driven model building to match with impressions sourced from alternate integrations. A common ID to pass is the ad server slot name. |    No    | string                                                          | `RenderingBanner`, `RenderingInterstitial`, `RenderingRewarded` |
| `gpID`               | The Global Placement ID (GPID) is a key that uniquely identifies a specific instance of an adunit.                                                                                                                                                                                                                                            |    No    | string                                                          | `RenderingBanner`, `RenderingInterstitial`, `RenderingRewarded` |
| `isReserved`         | The property that can be used to determine how the banner will appear. With or without reserved space. _Note: May be useful if the ad will be used where there is a lot of static content._ **Default:** `false`.                                                                                                                             |    No    | boolean                                                         | `RenderingBanner`                                               |
| `skipDelay`          | Sets delay in seconds to show close button. **Default:** `13`.                                                                                                                                                                                                                                                                                |    No    | number                                                          | `RenderingInterstitial`                                         |
| `minSizesPercentage` | Optional parameter to specify the minimum width/height percent an ad may occupy of a device’s screen. **Default:** `[80, 60]` // [width, height].                                                                                                                                                                                             |    No    | [number, number]                                                | `RenderingInterstitial`, `RenderingRewarded`                    |
| `onAdLoaded`         | A callback triggered when an ad is received.                                                                                                                                                                                                                                                                                                  |    No    | onAdLoaded?(): void                                             | `RenderingBanner`, `RenderingInterstitial`, `RenderingRewarded` |
| `onAdFailedToLoad`   | A callback triggered when an ad request failed.                                                                                                                                                                                                                                                                                               |    No    | onAdFailedToLoad?(error: AdError): void | `RenderingBanner`, `RenderingInterstitial`, `RenderingRewarded` |
| `onAdClicked`        | A callback triggered when a click is recorded for an ad.                                                                                                                                                                                                                                                                                      |    No    | onAdClicked?(): void                                            | `RenderingBanner`, `RenderingInterstitial`, `RenderingRewarded` |
| `onAdOpened`         | A callback triggered when an ad opens an overlay that covers the screen.                                                                                                                                                                                                                                                                      |    No    | onAdOpened?(): void                                             | `RenderingBanner`, `RenderingInterstitial`, `RenderingRewarded` |
| `onAdClosed`         | A callback triggered when the user is about to return to the app.                                                                                                                                                                                                                                                                             |    No    | onAdClosed?(): void                                             | `RenderingBanner`, `RenderingInterstitial`, `RenderingRewarded` |

</details>

## Remote Configuration Integration

The SDK supports a simplified integration using remote configuration. This allows you to manage ad units (GAM IDs, Prebid Config IDs, sizes, etc.) from the backend, requiring only a simple configuration ID in your app.

### Initialize SDK with Remote Configuration

Before using remote configuration ads, ensure the SDK is properly initialized:

```js
import { RNAudienzz, Targeting } from 'audienzz';

RNAudienzz()
  .initializeRemote(
    'https://dev-api.adnz.co/api/ws-sdk-config/public/v1/', // Audienzz remove config URL
    'YOUR_PUBLISHER_ID', // Will be provided for you
    false // enablePPID
  )
  .then((value) => {
    console.log('SDK initialized with remote config:', JSON.stringify(value, null, 2));
    // Optional: Add global targeting
    Targeting.addGlobalTargeting('TEST', '1');
  })
  .catch((error) => {
    console.error('Initialization error:', error);
  });
```

### Banner Ad (Remote Config)

Use `RemoteConfigBanner` to load a banner defined by a remote configuration ID.

<details>
<summary><span>Component example:</span></summary>

```jsx
import React from 'react';
import { RemoteConfigBanner } from 'audienzz';

function MyComponent() {
  return (
    <RemoteConfigBanner
      configId="YOUR_CONFIG_ID"
      onAdLoaded={(size) => {
        console.log('Remote banner loaded successfully');
        console.log('Ad size:', size);
      }}
      onAdFailedToLoad={(error) => {
        console.log('Remote banner failed to load:', error.message);
      }}
      onAdClicked={() => console.log('Remote banner clicked')}
      onAdOpened={() => console.log('Remote banner opened')}
      onAdClosed={() => console.log('Remote banner closed')}
    />
  );
}
```

</details>

#### Fixed Size Banner
To enforce a specific fixed size, pass the `width` and `height` props to the `RemoteConfigBanner` component. These dimensions will be used to request and display the ad:

```jsx
<RemoteConfigBanner
  configId="YOUR_CONFIG_ID"
  width={320}
  height={50}
/>
```

#### Adaptive Banner
If adaptive banners are enabled in the remote configuration, and you don't provide explicit `width` and `height` props (or provide 0), the SDK will automatically calculate the optimal size based on the container's layout dimensions:

```jsx
<RemoteConfigBanner
  configId="YOUR_CONFIG_ID"
  // size calculated automatically if enabled in backend
/>
```

<details>
<summary><span>Props:</span></summary>

| Name               | Description                                                | Required | Type                                                    |
| ------------------ | ---------------------------------------------------------- | :------: | ------------------------------------------------------- |
| `configId`         | Remote configuration ID for the ad unit.                   | **YES**  | string                                                  |
| `onAdLoaded`       | Callback when ad is loaded. Returns ad size.               |    No    | onAdLoaded?(size: AdSize): void |
| `onAdFailedToLoad` | Callback when ad fails to load.                            |    No    | onAdFailedToLoad?(error: {message: string}): void       |
| `onAdClicked`      | Callback when ad is clicked.                               |    No    | onAdClicked?(): void                                    |
| `onAdOpened`       | Callback when ad opens an overlay.                         |    No    | onAdOpened?(): void                                     |
| `onAdClosed`       | Callback when user returns to the app.                     |    No    | onAdClosed?(): void                                     |

</details>

### Interstitial Ad (Remote Config)

Use `RemoteConfigInterstitial` to load an interstitial defined by a remote configuration ID.

<details>
<summary><span>Component example:</span></summary>

```jsx
import React from 'react';
import { RemoteConfigInterstitial } from 'audienzz';

function MyComponent() {
  return (
    <RemoteConfigInterstitial
      configId="YOUR_CONFIG_ID"
      onAdLoaded={() => {
        console.log('Remote interstitial loaded successfully');
      }}
      onAdFailedToLoad={(error) => {
        console.log('Remote interstitial failed to load:', error.message);
      }}
      onAdClicked={() => console.log('Remote interstitial clicked')}
      onAdOpened={() => console.log('Remote interstitial opened')}
      onAdClosed={() => console.log('Remote interstitial closed')}
    />
  );
}
```

</details>

<details>
<summary><span>Props:</span></summary>

| Name               | Description                                                | Required | Type                                                    |
| ------------------ | ---------------------------------------------------------- | :------: | ------------------------------------------------------- |
| `configId`         | Remote configuration ID for the ad unit.                   | **YES**  | string                                                  |
| `onAdLoaded`       | Callback when ad is loaded.                                |    No    | onAdLoaded?(): void                                     |
| `onAdFailedToLoad` | Callback when ad fails to load.                            |    No    | onAdFailedToLoad?(error: {message: string}): void       |
| `onAdClicked`      | Callback when ad is clicked.                               |    No    | onAdClicked?(): void                                    |
| `onAdOpened`       | Callback when ad opens an overlay.                         |    No    | onAdOpened?(): void                                     |
| `onAdClosed`       | Callback when user returns to the app.                     |    No    | onAdClosed?(): void                                     |

</details>

## Targeting

The `Targeting` module provides extensive methods for user and application targeting, GDPR/COPPA compliance, and ORTB configuration.

### Usage Example
```js
import { Targeting } from 'audienzz';

// Set a single global targeting key-value
await Targeting.addGlobalTargeting('section', 'news');

// Set multiple values for a key
await Targeting.addGlobalTargetingSet('interests', ['tech', 'finance']);

// Remove a specific key
await Targeting.removeGlobalTargeting('section');

// Clear all global targeting
await Targeting.clearGlobalTargeting();

// Set GDPR compliance
await Targeting.setSubjectToGdpr(true);
await Targeting.setGdprConsentString('your-consent-string');

// Set user location
await Targeting.setUserLatLng(47.3769, 8.5417);
```

### Available Methods

#### User & App Keywords
- `addUserKeyword(keyword: string)`: Adds a context keyword for user targeting.
- `addUserKeywords(keywords: string[])`: Adds multiple keywords for user targeting.
- `clearUserKeywords()`: Removes all user keywords.
- `addAppKeyword(keyword: string)`: Adds a context keyword for app targeting.
- `addAppKeywords(keywords: string[])`: Adds multiple app keywords.

#### Compliance
- `setSubjectToCOPPA(isSubject: boolean)`: Sets the COPPA compliance status.
- `setSubjectToGDPR(isSubject: boolean)`: Sets the GDPR compliance status.
- `setGDPRConsentString(consent: string)`: Sets the GDPR consent string.

#### External User IDs
- `setExternalUserIds(userIds: AudienzzExternalUserId[])`: Sets the external user IDs for cross-device targeting.

#### Global Targeting
- `addGlobalTargeting(key: string, value: string)`: Adds a single global targeting key-value pair.
- `addGlobalTargetingSet(key: string, values: string[])`: Adds multiple values for a global targeting key.
- `removeGlobalTargeting(key: string)`: Removes a specific global targeting parameter.
- `clearGlobalTargeting()`: Clears all global targeting.

#### Location
- `setUserLatLng(lat: number, lng: number)`: Sets the user's geographic location.
- `clearUserLatLng()`: Clears the user's location.

#### ORTB Configuration
- `setGlobalOrtbConfig(ortbConfig: string)`: Sets a global OpenRTB configuration string.

License

Apache License 2.0
