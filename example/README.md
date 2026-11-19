# Audienzz React Native example

For publisher integration, start with the [five-step guide](../README.md#quick-integration-remote-config--pageimpression).
This app also contains lower-level and legacy examples for regression testing.

## Run

Install dependencies from the repository root:

```sh
yarn install
```

The example defaults to published **Android 0.3.7 / iOS 0.4.8**; no sibling checkout is needed.
For iOS, run `pod install` in `example/ios` before building. Optional local native testing is
documented in [LOCAL_TESTING.md](../LOCAL_TESTING.md). Then start Metro:

```sh
cd example
yarn start
```

In another terminal, from `example`:

```sh
yarn android
# Or: yarn ios
```

After native SDK changes, rebuild the app. For iOS Podfile
or dependency changes, rerun `pod install` in `example/ios`. Fast Refresh cannot update native code.

The app uses production publisher **35**, remote banners **46 / 48**, and interstitial **47** on
both platforms. IDs and endpoint live in [remoteConfig.ts](src/remoteConfig.ts). It adds `TEST=1`
targeting; ad-ops configuration determines which creatives match that targeting. Initialization
errors are shown on the startup screen with a retry action.

## Run on an iOS device

The project ships without a signing team and with the placeholder bundle id
`com.example.audienzzrnexample`, so it builds on the simulator as is. For a device:

1. `cd example/ios && pod install`, then open `AudienzzrnExample.xcworkspace` in Xcode.
2. Select the **AudienzzrnExample** target → **Signing & Capabilities** and choose your team
   (for both Debug and Release).
3. If Xcode reports the bundle id as unavailable, change it to one your team owns, e.g.
   `com.yourcompany.audienzzrnexample`. `Info.plist` reads it from `PRODUCT_BUNDLE_IDENTIFIER`,
   so the build setting is the only place to change.
4. Start Metro (`yarn start` in `example`) and run on the device from Xcode, or with
   `yarn ios --device`.

Keep your team and bundle id out of commits that you send back to this repository.

## Screens

- **Main:** fixed and adaptive RemoteBanners, scrolling content, and the separate Prefetch /
  Show / Prefetch and show interstitial actions.
- **Test Screen:** a RemoteBanner using placement **46**, opened from below either main banner.
- **Sticky ad:** remote banners in a sticky scrolling layout.
- **Reload tabs / Legacy:** additional lifecycle and older-integration regression checks.

Navigation reports the opening destination before its ads load, and reports subsequent visits,
including back navigation. App return and SDK interstitial dismissal recover banners without a
new analytics page when using the published native SDKs. Do not add another `pageImpression`
call to those callbacks.

Visibility labels describe eligibility, not proof that an auction or impression occurred. Use
`AUDZ` logs in Android logcat or the iOS native console. See [diagnostics and device checks](../LOCAL_TESTING.md#sdk-diagnostics),
including Charles setup, stationary loads and repeated interstitials.
