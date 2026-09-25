# Audienzz React Native SDK

> **Native dependencies:** Android `com.audienzz:sdk:0.3.0` (Maven Central) and
> iOS `AudienzziOSSDK ~> 0.4.0` (CocoaPods). These releases provide the page ownership,
> refresh and interstitial APIs used by this bridge. The examples use published dependencies
> by default. Optional local development overrides are described in [LOCAL_TESTING.md](LOCAL_TESTING.md).

> **Unreleased fixes on this branch:** adaptive iOS loading and banner-only slot numbering
> need the matching native fixes. Flutter also needs the new native interstitial context API.
> Until native releases and bridge pins are updated, use the local native overrides in
> [LOCAL_TESTING.md](LOCAL_TESTING.md#pending-native-fixes-in-this-branch).

## Quick integration (remote config + `pageImpression`)

The recommended path: Audienzz supplies your publisher and placement IDs, the backend configures
delivery, and managed components own each banner's lifecycle. Five steps.

### 1. Install

```sh
npm install audienzz          # or: yarn add audienzz
cd ios && pod install
```

Use the package release that requires **Android 0.3.0 / iOS 0.4.0** (this branch). Older React Native
releases do not include the managed APIs below. The native SDKs require **Android API 24** and
**iOS 15.0**; use a higher deployment target if your React Native version requires it.

Add your GAM/AdMob app ID to `AndroidManifest.xml` as `com.google.android.gms.ads.APPLICATION_ID`
and to `Info.plist` as `GADApplicationIdentifier` — see [Setup](#setup). In GAM, leave each banner
ad unit's **refresh rate unset**; Audienzz owns refresh.

### 2. Initialize once, at app startup

Run your CMP and forward its result through `Targeting` **before** initializing or creating ads —
see [Consent](#consent). Initialize from your app's startup flow, so every entry route uses it.

```tsx
import { Audienzz } from 'audienzz';

async function initializeAds() {
  await Audienzz.initializeRemote(
    'https://api.adnz.co/api/ws-sdk-config/public/v1/',
    'YOUR_PUBLISHER_ID',
  );
}
```

Await this once after consent, before mounting the ad-bearing navigation tree. Handle rejection
with your startup error/retry UI; keep app content available if initialization fails. Initialization
does not report a page — the real navigation state in step 3 does that.

**Android 0.3.0 supports the production configuration URL shown above only.** The bridge rejects
other URLs with `UNSUPPORTED_REMOTE_URL`; earlier versions silently ignored them. Use publisher
and placement IDs from the same environment. The example uses production publisher `35`, banner
placements `46` / `48`, and interstitial `47`; development publisher `81` does not exist there.

Testing Android through Charles? Use the example's **debug build** and install your Charles CA
on the device. Release builds retain normal certificate trust. See
[Charles setup and startup troubleshooting](LOCAL_TESTING.md#charles-ssl-proxying-on-android).

On iOS, if your app requests tracking permission, add `NSUserTrackingUsageDescription` and
resolve ATT while the app is active, **before ad initialization**. Prompt only for `notDetermined`;
a denied/restricted decision must still let your app initialize. IDFA remains unavailable without
authorization. The example includes this flow; the SDK never prompts automatically for publishers.
See [Apple's ATT request requirements](https://developer.apple.com/documentation/apptrackingtransparency/attrackingmanager/requesttrackingauthorization(completionhandler:)).

### 3. Report every screen — including screens without ads

> **Required:** every screen that becomes active must produce a `pageImpression` (PI), even if it
> contains no ads. This includes the initial screen, navigation to an ad-free settings/profile
> screen, tab changes, and returning to a previous screen. Report the screen independently of
> whether an ad loads. Reporting the destination releases the previous screen's banners so they
> cannot keep refreshing behind it.

Wire **both** callbacks around your existing React Navigation navigator:

```tsx
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {
  audienzzOnNavigationReady,
  audienzzOnNavigationStateChange,
} from 'audienzz';

const navigationRef = createNavigationContainerRef();

// In your initialized app:
<NavigationContainer
  ref={navigationRef}
  onReady={() => audienzzOnNavigationReady(navigationRef.getRootState())}
  onStateChange={audienzzOnNavigationStateChange}
>
  <AppNavigator />
</NavigationContainer>
```

`onReady` reports the opening screen; `onStateChange` covers later transitions, including nested
navigators and **ad-free destinations**. Reporting the destination releases the previous page's
banners. **The navigation adapter already reports PI: do not add a second manual `pageImpression`
call inside each screen for the same transition.**

### 4. Place a banner

Pass the `route` supplied to your screen by React Navigation:

```tsx
import React from 'react';
import { ScrollView, Text } from 'react-native';
import { AudienzzBanner, AudienzzPage } from 'audienzz';

function ArticleScreen({ route }: { route: { key: string } }) {
  return (
    <AudienzzPage name="article" route={route}>
      <ScrollView>
        <Text>Article content</Text>
        <AudienzzBanner
          adConfigId="YOUR_BANNER_CONFIG_ID"
          slotKey="article-middle"
          placeholderHeight={250}
        />
      </ScrollView>
    </AudienzzPage>
  );
}
```

Keep `slotKey` stable and unique within the page. Reserve the expected height **before** the ad
loads; `AudienzzBanner` mounts the placeholder, loads and disposes for you. Remote banners default
to lazy loading; the backend controls `lazyLoad`, prefetch distance and refresh settings.

The page wrapper binds the banner to its route instance and waits for navigation focus. Retained
screens and pre-mounted navigator tabs need no extra focus reporting. For custom navigation,
follow the [managed integration](#the-managed-integration-recommended) and its explicit `active` contract.

### 5. Show an interstitial

Keep one `RemoteConfigInterstitial` mounted per placement, above transient routes, with
`manualControl` so mounting it does not request or show an ad:

```tsx
import { useRef } from 'react';
import {
  RemoteConfigInterstitial,
  type RemoteConfigInterstitialHandle,
} from 'audienzz';

// Inside a persistent component:
const interstitial = useRef<RemoteConfigInterstitialHandle>(null);

// Include in that component's JSX:
<RemoteConfigInterstitial
  ref={interstitial}
  manualControl
  adConfigId="YOUR_INTERSTITIAL_CONFIG_ID"
  onAdFailedToLoad={(error) => console.warn('Interstitial load failed', error)}
  onAdFailedToShow={(error) => console.warn('Interstitial show failed', error)}
/>
```

Choose the flow that matches the display opportunity; call these from your app's event handlers:

```tsx
interstitial.current?.prefetch();          // Cache one ad; never presents.
interstitial.current?.show(canShowAd);     // Show now if ready; otherwise skip.

// Alternative: explicitly request presentation as soon as the ad is ready.
interstitial.current?.prefetchAndShow();
```

`canShowAd` is your current frequency-cap and screen-policy decision; apply that policy before
`prefetchAndShow()` too. Commands return `void`; observe callbacks and `onLifecycleEvent` for
outcomes. `isReady()` is advisory, and `show()` never queues a missed opportunity for later.
Repeated prefetches share an outstanding load and retain ready inventory. Unmounting disposes the
owner; keep it mounted through dismissal. See [remote interstitials](#interstitial-ad-remote-config).

### What the SDK handles

Managed banners own loading, page transitions, viewport refresh gating and disposal. Native code
pauses refresh in the background and handles foreground recovery. **Do not add refresh timers or
reload on render, navigation or app resume.** Smart Refresh v2 is selected by backend configuration;
without it, the classic viewport gate applies.

Report custom covers the SDK cannot see through the managed banner ref's `reportCover(true)` and
clear it when the cover disappears. For a whole retained page, set `AudienzzPage.active` to `false`.
See [test flows and local setup](LOCAL_TESTING.md) before shipping.

---

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

### Consent

The SDK does **not** gate itself on user consent — that's the app's responsibility.
Run your CMP (consent) flow and forward the result **before** you initialize the
SDK or load any ads:

1. Show your CMP and obtain the user's choice.
2. Forward the consent signals (GDPR subject, TCF consent string, purpose
   consents) via `RNTargeting()`.
3. **Then** call `RNAudienzz().initialize(...)` and load ads.

Initializing or loading ads before consent will request ads without the consent
signals.

### Initialize the Audienzz React Native SDK

Initialize once at app startup, after consent and before creating ads. PPID is controlled by the backend publisher configuration; initialization has no PPID argument.

```js
import RNAudienzz from 'audienzz';

RNAudienzz()
  .initialize('Company ID provided for the app by Audienzz')
  .then((value) => console.log(JSON.stringify(value, null, 2)));
```

------------------------------------
| Method                   | Parameters             | Description                                                                                                                              |
|--------------------------|------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `setPublisherPpid`       | `ppid: string \| null` | Supply your own PPID (e.g. a hashed e-mail). Takes precedence over the SDK-generated one; pass `null` to clear and fall back to it.       |
| `getPpid`                |                        | The PPID currently being sent: yours if set, otherwise the SDK-generated UUID. `null` when the backend disables PPID (`ppidEnabled: false`).                       |

PPID is enabled by default. The native SDK generates a persisted identifier, rotated every
12 months, unless you supply your own. The publisher configuration controls whether either
identifier is sent; there is no initialization argument for this:

| Publisher config field | Effect when `false` | Absent |
|---|---|---|
| `ppidEnabled` | No PPID is sent at all, including one you supplied | Enabled |

SDK controls:

| Method | Parameters | Description |
|---|---|---|
| `setSchainObject`        | `schain: string`       | Method used to set Schain object for all ad requests.                                                                                    |
| `pageImpression`        | `name: string`         | Report every screen/dialog by name, including ad-free destinations — fires a `pageImpression`. See [Screen tracking](#screen-tracking-analytics). |
| `setSmartRefreshV2Enabled` | `enabled: boolean`   | Force smart-refresh v2 (directional viewport gate) on/off, overriding backend config. Call **before** creating banners.                  |
| `setBlankOnScreenReload` | `enabled: boolean`     | Blank a banner's slot during a screen-resume reload (default `false`). Call **before** creating banners.                                 |
| `setAppVolume`           | `volume: number`       | Set the global ad audio volume for all ad types (`0.0`–`1.0`, `0.0` = muted). The SDK defaults to muted.                                 |

### Screen tracking (analytics)

The SDK ties ad events to the screen the user is on: reporting an ad-bearing screen fires a
`pageImpression` and starts a fresh page-impression id that groups every ad event on that visit.

### GAM prerequisite

When the SDK owns refresh, the **GAM ad unit's own refresh rate must be unset**. Two refresh owners
cannot be reconciled from the app: Google's server-configured refresh runs independently of the
SDK's scheduler, and no publisher lifecycle code can compensate for it. Check this per ad unit
before enabling smart refresh.

### The managed integration (recommended)

Wire navigation once, place a banner, and write nothing else. No `load()`, no `Timer`, no reload
after a page impression or an app resume, no disposal.

```tsx
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import {
  AudienzzBanner,
  AudienzzPage,
  audienzzOnNavigationReady,
  audienzzOnNavigationStateChange,
} from 'audienzz';

const navigationRef = createNavigationContainerRef();

export default function App() {
  return (
    <NavigationContainer
      ref={navigationRef}
      // Both callbacks. React Navigation does not emit `onStateChange` for the first
      // render, so without `onReady` the opening screen is never reported.
      onReady={() => audienzzOnNavigationReady(navigationRef.getRootState())}
      // Covers nested navigators and ad-free destinations — reporting those is what
      // releases the previous page's banners.
      onStateChange={audienzzOnNavigationStateChange}
    >
      <Stack.Navigator>{/* … */}</Stack.Navigator>
    </NavigationContainer>
  );
}

function ArticleScreen({ route }) {
  return (
    // Pass the `route` React Navigation gives your screen. That is what binds this page to
    // that route instance, so returning to a retained screen reactivates the banners that
    // are actually on it.
    <AudienzzPage name="article" route={route}>
      <ArticleBody />
      {/* Reserves its height immediately and loads as it nears the viewport. */}
      <AudienzzBanner adConfigId="118" slotKey="in-content-1" placeholderHeight={250} />
    </AudienzzPage>
  );
}
```

`AudienzzPage` and the navigation adapter give **each route instance its own page identity**, so
two article screens both named `article` own their banners separately with nothing to configure.
They resolve the *same* handle for the same screen, and only one activation is reported per
navigation.

`Audienzz.pageImpression(name)` keeps **name identity**, so reporting a screen again still matches
the banners already on it and refreshes them. Compatibility lives at that boundary; it does not
weaken the managed contract.

`AudienzzBanner` identifies a slot by `(page, slotKey)` — an `adConfigId` is not unique, the same
placement can appear twice on one screen — and binds explicitly to the page it is rendered inside,
not to whichever page was activated most recently.

`<AudienzzPage id="…">` is available when a host wants to choose the identity itself — a custom
router with its own stable per-instance key. It is not needed for the default setup.

**Tabs and retained screens need nothing extra.** With `route` supplied, focus is the adapter's to
decide: a screen is active only while its route is the one being reported. A pre-mounted tab, and a
screen whose content finishes loading after the reader has already moved on, both stay dormant and
become active when focus returns.

Passing `route` **hands focus to the adapter**, including at startup: the page stays dormant — no
page impression, no ad — until the adapter names that route. That is why both callbacks above are
required. `onReady` is what reports the opening screen; wire only `onStateChange` and a navigator
that pre-mounts its tabs (`lazy: false`) opens the app with every screen still waiting.

If you are **not** using the adapter, do not pass `route`. Use `id` (or neither) and the wrapper
decides its own focus from `active`, as a standalone screen does. The two ownership modes are
deliberately distinct: a routed page that guessed it was focused whenever nothing had reported yet
would report a visit for every pre-mounted tab during startup.

`active` is there for a host that has its own reason to stand a page down — an interstitial
covering the screen, a wizard step that is mounted but not yet reached:

```tsx
<AudienzzPage name="feed" route={route} active={!isPaywallShowing}>
  <AudienzzBanner adConfigId="118" slotKey="feed-top" />
</AudienzzPage>
```

**Custom router?** One contract: mint a handle per route instance and activate it when that route
becomes visible.

```ts
// `createPage` gives a page whose identity IS its name — the legacy contract, so reporting the
// same screen again refreshes its banners rather than releasing them.
Audienzz.activatePage(createPage('article'));

// A router with its own stable per-instance key should use that instead, so two article routes
// own their banners separately:
Audienzz.activatePage({ id: routeKey, name: 'article' });
```

Activate the destination on every transition, including to screens with no ads. Activating a page is
what deactivates the previous one.

### Reporting screens without the managed components

If you render `RemoteConfigBanner` yourself, you own the ordering: **report the page, then render
its banners.** A banner captures its page when it is constructed, so report from the navigation
action — the router callback, the tab handler — and never from a parent effect.

```ts
// In the navigation handler, before the destination renders.
Audienzz.activatePage(createPage('article'));
```

React effects run after commit, child first, so a report from a parent `useEffect` lands *after* the
destination's banners have already captured the previous page — permanently, because the binding is
a class field. `useLayoutEffect` does not help; layout effects run child-first too. That is the
defect `AudienzzPage` exists to remove, and it is why moving navigation side effects into render is
not the answer either.

Notes:
- `pageImpression(name)` mints a handle for you. Two calls with the same name are two pages.
- A page impression is the whole transition: native releases every banner that is not on the
  incoming page and re-auctions the ones that are. **Do not also reload manually** — that gives one
  transition two owners and two auctions, the second discarding the creative the first just fetched.

Two optional session-wide toggles tune this behavior (call **before** creating banners):

```js
// Use the v2 directional viewport gate (top fully on screen, at most half off the
// bottom) instead of the legacy 20%-visible gate. Overrides backend config.
Audienzz.setSmartRefreshV2Enabled(true);

// Blank the slot for the duration of a screen-resume reload (default: keep the old
// creative until the new one arrives).
Audienzz.setBlankOnScreenReload(true);
```

### Displaying Ads

The Audienzz React Native SDK allows you to display three types Ads - `Banner`, `Interstitial` and `Rewarded`.

#### Original API

`OriginalInterstitial` and `OriginalRewarded` present automatically after loading. Their former
`show()` ref handles did nothing and have been removed, including the exported handle types.
Use `onAdLoaded` for load completion, `onAdOpened` for presentation, and `onAdFailedToShow`
for presentation errors. For explicit `prefetch()` / `show()` / `prefetchAndShow()` control,
use `RemoteConfigInterstitial`.

See [the audit migration notes](docs/audit-migration.md) for the release changes and validation.

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
      adUnitId="adUnitID"
      auConfigId="auConfigID"
      sizes={[AdSizes.MEDIUM_RECTANGLE]}
      adFormats={['banner']}
      isLazyLoad={false}
      refreshTimeMillis={30000}
      smartRefresh={true}
      onAdLoaded={(size) => console.log('success', size)}
      onAdClicked={() => console.log('clicked')}
      onAdOpened={() => console.log('ad opened')}
      onAdClosed={() => console.log('ad closed')}
      onAdFailedToLoad={(error) => console.log(`ERROR -> ${JSON.stringify(error, null, 2)}`)}
      isReserved
    />

   ...

    {/* Formats and API frameworks are backend-controlled: no adFormats / apiParameters props.
        See docs/interstitial-capabilities.md. */}
    <OriginalInterstitial
      adUnitId="adUnitID"
      auConfigId="auConfigID"
      isLazyLoad={false}
      onAdLoaded={() => console.log('INTERSTITIAL success')}
      onAdFailedToLoad={(error) => console.log(`INTERSTITIAL ERROR -> ${JSON.stringify(error, null, 2)}`)}
    />

   ...

    <OriginalRewarded
      adUnitId="adUnitID"
      auConfigId="auConfigID"
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
| `adUnitId`                | An ID identifies your banner in the system. You should have a valid, active placement ID to monetize your app.                                                                                                                                                                                                                                | **YES**  | string                                                                                                                                                                                                                        | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `auConfigId`              | An ID of the Stored Impression on the Audienzz Server.                                                                                                                                                                                                                                                                                        | **YES**  | string                                                                                                                                                                                                                        | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `sizes`                   | Array of ad sizes that will be used in the bid request.                                                                                                                                                                                                                                                                              | **YES**  | AdSize[]                                                                                                                                                                                                                        | `OriginalBanner`                                             |
| `isLazyLoad`              | The property that controls when an ad request will be made (tracks the viewport). **Default:** `true`.                                                                                                                                                                                                                                        |    No    | boolean                                                                                                                                                                                                                       | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `pbAdSlot`                | PB Ad Slot is an identifier tied to the placement the ad will be delivered in. The use case for PB Ad Slot is to pass to exchange an ID they can use to tie to reporting systems or use for data science driven model building to match with impressions sourced from alternate integrations. A common ID to pass is the ad server slot name. |    No    | string                                                                                                                                                                                                                        | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `gpId`                    | The Global Placement ID (GPID) is a key that uniquely identifies a specific instance of an adunit.                                                                                                                                                                                                                                            |    No    | string                                                                                                                                                                                                                        | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `impOrtbConfig`           | The property is used to supply ad request with a custom ORTB configuration that would be merged with imp field in request.                                                                                                                                                                                                                    |    No    | string                                                                                                                                                                                                                        | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `apiParameters`           | The property is dedicated to adding values for API Frameworks to a bid response according to the OpenRTB 2.5 spec. **Default:** `[‘MRAID_2’]`.                                                                                                                                                                                                |    No    | Array<’MRAID_1’ &#124; ‘MRAID_2’ &#124; ‘MRAID_3’ &#124; ‘VPAID_1’ &#124; ‘VPAID_2’ &#124; ‘OMID_1’ &#124; ‘ORMMA’>                                                                                                           | `OriginalBanner`, `OriginalRewarded` |
| `videoProtocols`          | Array or enum of OpenRTB 2.5 supported Protocols. **Default:** `[‘VAST_2_0’]`.                                                                                                                                                                                                                                                                |    No    | Array<’VAST_1_0’ &#124; ‘VAST_2_0’ &#124; ‘VAST_3_0’ &#124; ‘VAST_4_0’ &#124; ‘DAAST_1_0’ &#124; ‘VAST_1_0_Wrapped’ &#124; ‘VAST_2_0_Wrapped’ &#124; ‘VAST_3_0_Wrapped’ &#124; ‘VAST_4_0_Wrapped’ &#124; ‘DAAST_1_0_Wrapped’> | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `videoDuration`           | A property representing the OpenRTB 2.5 video ad duration in seconds. **Default:** `[5, 30]` // [min, max].                                                                                                                                                                                                                                   |    No    | [number, number]                                                                                                                                                                                                              | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `videoBitrate`            | The property representing the OpenRTB 2.5 bit rate in Kbps. **Default:** `[300, 1500]` // [min, max].                                                                                                                                                                                                                                         |    No    | [number, number]                                                                                                                                                                                                              | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `playbackMethod`          | Array of OpenRTB 2.5 playback methods. Only one method is typically used in practice. It is strongly advised to use only the first element of the array. **Default:** `[‘AutoPlaySoundOn’]`.                                                                                                                                                  |    No    | Array<’AutoPlaySoundOn’ &#124; ‘AutoPlaySoundOff’ &#124; ‘ClickToPlay’ &#124; ‘MouseOver’ &#124; ‘EnterSoundOn’ &#124; ‘EnterSoundOff’>                                                                                       | `OriginalBanner`, `OriginalInterstitial`, `OriginalRewarded` |
| `adFormats`               | This ad unit formats for the current ad unit. **Default:** (Multiformat) `[‘banner’, ‘video’]`.                                                                                                                                                                                                                                               |    No    | Array<’banner’ &#124; ‘video’>                                                                                                                                                                                                | `OriginalBanner`                                             |
| `videoPlacement`          | OpenRTB 2.5 Placement Type for the auction. **Default:** `’inBanner’`.                                                                                                                                                                                                                                                                        |    No    | ‘inBanner’ &#124; ‘inArticle’ &#124; ‘inFeed’ &#124; ‘interstitial’                                                                                                                                                           | `OriginalBanner`                                             |
| `isReserved`              | The property that can be used to determine how the banner will appear. With or without reserved space. _Note: May be useful if the ad will be used where there is a lot of static content._ **Default:** `false`.                                                                                                                             |    No    | boolean                                                                                                                                                                                                                       | `OriginalBanner`                                             |
| `isAdaptive`              | The property that can be used to work with multiply size banner. **Default:** `false`.                                                                                                                             |    No    | boolean                                                                                                                                                                                                                       | `OriginalBanner`                                             |
| `refreshTimeMillis`       | Auto-refresh interval in milliseconds. Cannot be less than 30 000 ms. To manually stop or resume refresh call `stopAutoRefresh()` / `resumeAutoRefresh()` on the component ref. (Replaces deprecated `autoRefreshPeriodMillis`.)                                                                                                              |    No    | number                                                                                                                                                                                                                        | `OriginalBanner`                                             |
| `smartRefresh`            | When `true`, pauses auto-refresh while less than 20 % of the ad height is visible, and resumes it when the ad scrolls back into view. On resume the timer is stale-aware: if the refresh interval already elapsed while off-screen the ad is refreshed immediately; otherwise it waits only the remaining time. Requires `refreshTimeMillis`. **Default:** `false`. |    No    | boolean                                                                                                                                                                                                                       | `OriginalBanner`                                             |
| `prefetchMargin`          | Distance in logical pixels (pt on iOS, dp on Android) ahead of the viewport at which the Prebid demand fetch is triggered. Only effective when `isLazyLoad={true}`. Has no practical effect inside `FlatList`/recycled lists — use `isLazyLoad={false}` there instead. **Default:** `200`.                                                   |    No    | number                                                                                                                                                                                                                        | `OriginalBanner`                                             |
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
      adUnitId="adUnitID"
      auConfigId="auConfigID"
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
      adUnitId="adUnitID"
      auConfigId="auConfigID"
      adFormat="video"
      onAdLoaded={() => console.log('INTERSTITIAL success')}
      onAdFailedToLoad={(error) => console.log(`INTERSTITIAL ERROR -> ${JSON.stringify(error, null, 2)}`)}
    />

   ...

    <RenderingRewarded
      adUnitId="adUnitID"
      auConfigId="auConfigID"
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
| `adUnitId`           | An ID identifies your banner in the system. You should have a valid, active placement ID to monetize your app.                                                                                                                                                                                                                                | **YES**  | string                                                          | `RenderingBanner`, `RenderingInterstitial`, `RenderingRewarded` |
| `auConfigId`         | An ID of the Stored Impression on the Audienzz Server.                                                                                                                                                                                                                                                                                        | **YES**  | string                                                          | `RenderingBanner`, `RenderingInterstitial`, `RenderingRewarded` |
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
    'https://api.adnz.co/api/ws-sdk-config/public/v1/', // Audienzz remote config URL
    'YOUR_PUBLISHER_ID' // Provided by Audienzz
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
      adConfigId="YOUR_CONFIG_ID"
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
  adConfigId="YOUR_CONFIG_ID"
  width={320}
  height={50}
/>
```

#### Adaptive Banner
If adaptive banners are enabled in the remote configuration, and you don't provide explicit `width` and `height` props (or provide 0), the SDK will automatically calculate the optimal size based on the container's layout dimensions:

```jsx
<RemoteConfigBanner
  adConfigId="YOUR_CONFIG_ID"
  // size calculated automatically if enabled in backend
/>
```

#### When the auction starts

A `RemoteConfigBanner` waits until the slot comes within the prefetch margin before auctioning. Both settings come from the ad config only — `lazyLoad` (default `true`) and `prefetchDistanceDp` (default `200` dp/pt) — so a placement is tuned in the backend, behaves the same on every platform, and changes without an app release. There are no props for them.

> In a `FlatList`, the prefetch distance is usually the setting that matters: the ad component mounts many viewports ahead, so the margin — not the list — decides when the auction starts. If raising it in the ad config does not move the auction earlier, raise the list's `windowSize` / `initialNumToRender` instead.

<details>
<summary><span>Props:</span></summary>

| Name               | Description                                                | Required | Type                                                    |
| ------------------ | ---------------------------------------------------------- | :------: | ------------------------------------------------------- |
| `adConfigId`       | Remote configuration ID for the ad unit.                   | **YES**  | string                                                  |
| `onAdLoaded`       | Callback when ad is loaded. Returns ad size.               |    No    | onAdLoaded?(size: AdSize): void |
| `onAdFailedToLoad` | Callback when ad fails to load.                            |    No    | onAdFailedToLoad?(error: {message: string}): void       |
| `onAdClicked`      | Callback when ad is clicked.                               |    No    | onAdClicked?(): void                                    |
| `onAdOpened`       | Callback when ad opens an overlay.                         |    No    | onAdOpened?(): void                                     |
| `onAdClosed`       | Callback when user returns to the app.                     |    No    | onAdClosed?(): void                                     |

</details>

### Interstitial formats and API frameworks — breaking

An interstitial's formats and API frameworks are backend-controlled: the ad config's `prebidConfig.format` (`banner` / `video` / `bannerAndVideo`, default `bannerAndVideo`) and `prebidConfig.apis` (default `[3, 5, 6, 7]`), validated identically on iOS and Android and read once per accepted load. `OriginalInterstitial` no longer takes `adFormats` or `apiParameters`; a hand-built interstitial always uses the defaults, and `RemoteConfigInterstitial` uses its ad config. See [docs/interstitial-capabilities.md](docs/interstitial-capabilities.md).

### Interstitial Ad (Remote Config)

Use one persistent `RemoteConfigInterstitial` with `manualControl` to prefetch inventory and present only at a publisher-approved transition. Keep it mounted above transient routes until dismissal. Do not remount it to retry a missed opportunity.

Three verbs, and the verb decides whether anything is presented:

| Method | What it does |
| --- | --- |
| `prefetch()` | Obtains and retains one ad. Never presents. |
| `show(eligible?)` | Presents ready inventory at this opportunity, or reports why it could not. Never schedules a presentation for later. `eligible` defaults to `true`. |
| `prefetchAndShow()` | Presents when the load completes, or presents inventory already in hand. |

```tsx
import React, { useRef } from 'react';
import { Button } from 'react-native';
import {
  RemoteConfigInterstitial,
  type RemoteConfigInterstitialHandle,
} from 'audienzz';

function InterstitialPlacement({ eligible }: { eligible: boolean }) {
  const ad = useRef<RemoteConfigInterstitialHandle>(null);
  return (
    <>
      <RemoteConfigInterstitial
        ref={ad}
        adConfigId="YOUR_CONFIG_ID"
        manualControl
        onAdLoaded={() => console.log('Ready for a future opportunity')}
        onAdFailedToLoad={(error) => console.log('Load failed', error)}
        onAdFailedToShow={(error) => console.log('Presentation failed', error)}
        onAdImpression={() => console.log('Impression')}
        onLifecycleEvent={(event) => console.log('Interstitial lifecycle', event)}
      />
      <Button title="Prefetch" onPress={() => ad.current?.prefetch()} />
      <Button title="Continue" onPress={() => ad.current?.show(eligible)} />
    </>
  );
}
```

In your app, prefetch ahead of a natural transition. Pass current frequency-cap and placement eligibility into `show`; the SDK does not calculate publisher frequency caps. Continue normal navigation if no ad appears. Do not call `show` from `onAdLoaded` — if you want the ad presented as soon as it arrives, say so with `prefetchAndShow()` — and do not automatically replay a skipped opportunity.

| API | Behavior |
| --- | --- |
| `manualControl` | Opt in; mounting does not load or show. Keep this and `adConfigId` stable. Changing either releases the previous owner. |
| `prefetch()` | Obtain and retain one ad; never presents. A call made while a load is in flight joins it, and one made with valid inventory in hand reuses it — neither spends another request. |
| `show(eligible?)` | Check native readiness, foreground state and managed presentation ownership once. A skip retains ready inventory and never queues a later show. `eligible` defaults to `true`. |
| `prefetchAndShow()` | Present as soon as the load completes, or present inventory already in hand, under the same guards as `show`. The only command that presents something you did not explicitly time. |
| `dispose()` | Release this owner permanently; subsequent commands are ignored. Unmount also releases it. |
| `onAdFailedToLoad` / `onAdFailedToShow` | Separate failures; payload contains `code`, `message` and, when available, `domain`. |
| `onLifecycleEvent` | Native diagnostics, including `opportunitySkipped` and its reason, load/presentation events and available load/response IDs. |

#### Migrating from `preload` / `showAtOpportunity`

| Before | Now |
| --- | --- |
| `preload()` | `prefetch()` |
| `showAtOpportunity(eligible)` | `show(eligible)` |
| `show()` | `show()` — unchanged; it still means "I have decided this is an opportunity" |
| `manualControl={false}` | unchanged; it is `prefetchAndShow()` on mount, now spelled that way internally |

Commands return `void` because the React Native bridge is asynchronous. Observe `onAdOpened`, `onAdFailedToShow`, `onAdImpression`, and lifecycle events for outcomes. A command is not proof of an impression. An unmounted/disposed component stops receiving callbacks, even if a fullscreen ad is still closing.

Without `manualControl`, mounting performs `prefetchAndShow()` — the same behaviour as before, now named for what it does. The new flow applies to **RemoteConfigInterstitial**; the lower-level Original and Rendering interstitial components retain their existing APIs. Native presentation exclusion covers SDK-managed remote interstitials, not unrelated fullscreen ads presented outside this API.

**Native dependency:** these commands require Android 0.3.0 and iOS 0.4.0, the published versions selected by this bridge.

## Sticky Ad Wrapper

`AudienzzStickyAdWrapper` keeps a banner pinned within a reserved area of the scroll view as the user scrolls past it. The ad slides up inside the reserved space, staying visible for as long as possible before exiting at the bottom — mirroring the behaviour of the native iOS and Flutter sticky wrappers.

### How it works

- The wrapper reserves `maxHeight` logical pixels in your layout — other content flows around it normally.
- It observes the `scrollY` animated value and repositions the child ad via `translateY`, keeping it visible as the user scrolls past the reserved area.
- When the wrapper is fully above or below the visible viewport, the ad snaps to its natural position. When partially in view, it slides to stay on screen.

### Usage with Original API banner

```tsx
import { useRef } from 'react';
import { Animated, ScrollView } from 'react-native';
import { OriginalBanner, AudienzzStickyAdWrapper } from 'audienzz';

function MyScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <Animated.ScrollView
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
    >
      {/* … content above the ad … */}

      <AudienzzStickyAdWrapper scrollY={scrollY} maxHeight={450}>
        <OriginalBanner
          adUnitId="adUnitID"
          auConfigId="auConfigID"
          sizes={[{ width: 300, height: 250 }]}
          adFormats={['banner']}
          isLazyLoad={false}
          smartRefresh={true}
          refreshTimeMillis={30000}
          onAdLoaded={() => console.log('sticky ad loaded')}
          onAdFailedToLoad={(error) => console.log('failed', error)}
        />
      </AudienzzStickyAdWrapper>

      {/* … content below the ad … */}
    </Animated.ScrollView>
  );
}
```

### Usage with Remote Config banner

`RemoteConfigBanner` works as the child view without any changes — wrap it directly:

```tsx
import { useRef } from 'react';
import { Animated, ScrollView } from 'react-native';
import { RemoteConfigBanner, AudienzzStickyAdWrapper } from 'audienzz';

function MyScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <Animated.ScrollView
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
    >
      {/* … content above the ad … */}

      <AudienzzStickyAdWrapper scrollY={scrollY} maxHeight={600}>
        <RemoteConfigBanner
          adConfigId="YOUR_CONFIG_ID"
          onAdLoaded={(size) => console.log('sticky remote banner loaded', size)}
          onAdFailedToLoad={(error) => console.log('failed', error)}
        />
      </AudienzzStickyAdWrapper>

      {/* … content below the ad … */}
    </Animated.ScrollView>
  );
}
```

### Props

| Name              | Description                                                                                                                     | Required | Type              | Default |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- | :------: | ----------------- | ------- |
| `children`        | The ad component to wrap (typically `OriginalBanner` or `RemoteConfigBanner`).                                                  | **YES**  | ReactNode         | —       |
| `scrollY`         | Animated scroll-Y value from the parent `ScrollView` or `FlatList`. Must be created with `useRef(new Animated.Value(0)).current`. | **YES**  | Animated.Value    | —       |
| `maxHeight`       | Height in logical pixels reserved in the layout for the sticky zone.                                                            |    No    | number            | `600`   |
| `stickyTopOffset` | Y offset from the viewport top at which the ad should stick. Use `statusBarHeight + navigationBarHeight` when a fixed header is present. |    No    | number            | `0`     |
| `enabled`         | Set to `false` to disable sticky behaviour (ad renders in its normal flow position).                                            |    No    | boolean           | `true`  |

> **Tip:** Combine with `smartRefresh={true}` on the inner `OriginalBanner` so that auto-refresh pauses automatically while the ad is scrolled out of the sticky zone.

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
- `updateGlobalTargeting(key: string, values: string[])`: Replaces the value set for an existing key in one call (shorthand for remove + add).
- `removeGlobalTargeting(key: string)`: Removes a specific global targeting parameter.
- `clearGlobalTargeting()`: Clears all global targeting.

#### Location
- `setUserLatLng(lat: number, lng: number)`: Sets the user's geographic location.
- `clearUserLatLng()`: Clears the user's location.

#### ORTB Configuration
- `setGlobalOrtbConfig(ortbConfig: string)`: Sets a global OpenRTB configuration string.

License

Apache License 2.0

### Automatic request counters

Original and remote banners include `au_page_seq`, `au_slot` and `hb_refresh_count` in GAM
custom targeting. Interstitials include only `au_page_seq` and `hb_refresh_count`; they never
consume a banner position. See [the request targeting contract](docs/ad-request-targeting.md)
for page resets, automatic slot ordering and request-count semantics. No new publisher parameter is required.
