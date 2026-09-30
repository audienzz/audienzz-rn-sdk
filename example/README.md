# Audienzz React Native example

For publisher integration, start with the [five-step guide](../README.md#quick-integration-remote-config--pageimpression).
This app also contains lower-level and legacy examples for regression testing.

## Run

Install dependencies from the repository root:

```sh
yarn install
```

This branch uses **local native SDKs**. Follow [LOCAL_TESTING.md](../LOCAL_TESTING.md) to publish
Android locally and install the iOS development pod before building. Then start Metro:

```sh
cd example
yarn start
```

In another terminal, from `example`:

```sh
yarn android
# Or: yarn ios
```

After native SDK changes, republish the Android local artifact / rebuild the app. For iOS Podfile
or dependency changes, rerun `pod install` in `example/ios`. Fast Refresh cannot update native code.

The app uses production publisher **35**, remote banners **46 / 48**, and interstitial **47** on
both platforms. IDs and endpoint live in [remoteConfig.ts](src/remoteConfig.ts). It adds `TEST=1`
targeting; ad-ops configuration determines which creatives match that targeting. Initialization
errors are shown on the startup screen with a retry action.

## Screens

- **Main:** fixed and adaptive RemoteBanners, scrolling content, and the separate Prefetch /
  Show / Prefetch and show interstitial actions.
- **Test Screen:** a RemoteBanner using placement **46**, opened from below either main banner.
- **Sticky ad:** remote banners in a sticky scrolling layout.
- **Reload tabs / Legacy:** additional lifecycle and older-integration regression checks.

Navigation reports the opening destination before its ads load, and reports subsequent visits,
including back navigation. App return and SDK interstitial dismissal recover banners without a
new analytics page when using the current local native SDKs. Do not add another `pageImpression`
call to those callbacks.

Visibility labels describe eligibility, not proof that an auction or impression occurred. Use
`AUDZ` logs in Android logcat or the iOS native console. See [diagnostics and device checks](../LOCAL_TESTING.md#sdk-diagnostics),
including Charles setup, stationary loads and repeated interstitials.
