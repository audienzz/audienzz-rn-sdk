# Audit fixes migrated into the page-impression release

PR #43 incorporates the still-applicable changes from PR #39. The older branch should not be
merged separately after this migration. The current page lifecycle, durable publisher pause,
native dependency pins, backend interstitial capabilities and remote interstitial commands are
preserved.

## Changes

- iOS OriginalBanner loads the request supplied by the SDK for each auction. It carries the
  current Prebid, global and SDK targeting. Its callback is installed before creation, captures
  the bridge weakly, and is cleared when the banner is replaced or destroyed.
- iOS banner replacement destroys the old owner; a late failure from the old Google view cannot
  remove its replacement. Controller selection prefers the ad's own window.
- iOS original interstitial size hints merge into publisher OpenRTB configuration, preserving
  unrelated fields. Rewarded video explicitly uses interstitial placement.
- Android initialization rejects its promise on failure. All five original/rendering full-screen
  and rendering-banner creation paths report a missing Activity instead of force-unwrapping it.
- Android OriginalBanner retires its previous handler even when replacement stops early because
  the Activity or required props are missing.
- Dismissing a rewarded ad without earning a reward is safe. Original full-screen presentation
  failures reach `onAdFailedToShow` on both platforms.
- Lazy or reserved OriginalBanner components reserve their first requested size before loading;
  playback methods and no-argument banner events are forwarded correctly.

## Breaking API correction

The nonfunctional `show()` handles on `OriginalInterstitial` and `OriginalRewarded`, and their
exported handle types, are removed. These components keep their automatic presentation behavior.
`onAdLoaded` means loaded, not displayed; use `onAdOpened` to observe presentation.
`RemoteConfigInterstitial` retains its explicit prefetch/show API.

## Regression checks

`yarn test --runInBand` and `yarn typecheck` check the JavaScript components and public types.
From `example/android`, run `./gradlew :audienzz:testDebugUnitTest` with the local native version
configured as described in [LOCAL_TESTING.md](../LOCAL_TESTING.md).

The iOS example's `AudienzzrnExampleTests` target exercises the real bridge callbacks and ownership
with network entry points intercepted. The test scheme starts without Metro; ordinary example
launches are unchanged. Install Pods against the local SDK, then run the scheme's tests on an
iOS simulator. Tests cover distinct SDK/Google request objects, replacement, deallocation, stale
failures, OpenRTB preservation, rewardless dismissal and window ownership.

These checks do not replace device or live-ad validation.
