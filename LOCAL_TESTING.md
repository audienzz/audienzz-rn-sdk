# Running this example against the LOCAL native SDKs

On `feature/page-impression-api`, the example uses local native SDKs:
`../audienzz-android-sdk` and `../audienzz-ios-sdk` (relative to this repository).
Publish Android locally as described below; iOS links directly to source. Use current native
`main` branches, which include analytics batching, foreground/interstitial
page continuity, and cold-start attribution fixes. The library package pins remain Android
`0.3.1` / iOS `~> 0.4.1`; those published versions predate these changes. Publish new natives
and update the package pins before releasing this wrapper.

The example's endpoint, publisher and placement IDs live in `example/src/remoteConfig.ts`.
It uses production publisher **35**, fixed banner **46**, adaptive banner **48**, and interstitial
**47** on both platforms.

## Android — local Maven build

The example's `gradle.properties` selects `audienzzNativeVersion=0.3.1-local`.
Publish current native sources before the first build, and again after native edits:

```bash
cd ../audienzz-android-sdk
./gradlew :Audienzz:publishToMavenLocal \
  -I ../audienzz-rn-sdk/example/android/publish-local-native.gradle
cd ../audienzz-rn-sdk/example/android
./gradlew :app:dependencyInsight --dependency com.audienzz:sdk \
  --configuration debugRuntimeClasspath --refresh-dependencies
```

The init script changes only the local publication coordinate and disables signing for that
local build. It does not edit the native release version or publish anything remotely. Resolution
must show `com.audienzz:sdk:0.3.1-local`. Keep the property set while testing so a plain app rebuild
continues using the local artifact. Republish and use `--refresh-dependencies` after native edits;
hot reload does not replace native code. A missing local artifact fails dependency resolution.

Direct Gradle source substitution is not used: native and wrapper builds use different Android
Gradle plugin versions. To verify a future published release, remove `audienzzNativeVersion`
and update the library's released dependency pin first.

## iOS — local development pod

The example Podfile defaults to `../../../audienzz-ios-sdk`:

```bash
cd example/ios
pod install
```

It prints `[Audienzz] using LOCAL iOS SDK`. CocoaPods compiles sources from that checkout.
Rebuild after native edits; rerun `pod install` after adding/removing native source files.
`AUDIENZZ_IOS_SDK_PATH=/another/checkout pod install` selects a different checkout.
An empty override (`AUDIENZZ_IOS_SDK_PATH='' pod install`) selects the released dependency.
Keep the same override on subsequent CocoaPods/Flutter invocations when testing a released SDK.

## Run

```bash
cd ~/Documents/audienzz-rn-sdk/example
yarn ios
# Or: yarn android
```

## Collecting a log

### Charles SSL Proxying on Android

Use an **example debug APK built from this branch**. Its debug-only network security configuration
trusts user-installed CAs, including Charles, alongside Android's system CAs. The release app and
the published SDK library do not receive this trust override. Installing the certificate alone
does not make a release APK trust it.

1. Put the phone and Charles computer on the same network. Set the phone's Wi-Fi HTTP proxy to
   the computer's address and Charles port (usually 8888), and allow the device in Charles.
2. Use Charles's **Help → SSL Proxying → Install Charles Root Certificate on a Mobile Device or
   Remote Browser** instructions. Download the certificate through that proxy and install it
   in Android settings as a **CA certificate**. Each Charles installation has its own certificate.
3. Enable SSL Proxying for the hosts being investigated (remote configuration, the configured
   Prebid server and Google ad requests). Keep the SDK's original HTTPS URLs: normal traffic
   inspection needs the HTTP proxy plus SSL Proxying, not a replacement SDK endpoint.
4. Rebuild/install the debug app, then fully close and reopen it. Fast Refresh cannot apply
   Android manifest or certificate trust changes. If using Metro, keep it running and use
   `adb reverse tcp:8081 tcp:8081` over USB as usual.

The startup screen shows reported initialization errors with their codes and a retry button.
If the native callback has not arrived after 30 seconds, it shows network/Charles instructions
without starting a second initialization. It still accepts a later successful callback. Correct
the proxy/certificate setup and relaunch if initialization remains pending. If a certificate
error persists, record its complete message: a hostname mismatch or an expired certificate is
different from an untrusted CA and is still rejected.

For a publisher's own test app, apply the same configuration in **that app's debug source set**;
the SDK intentionally cannot change a host app's certificate trust.

References: [Charles certificate setup](https://www.charlesproxy.com/documentation/using-charles/ssl-certificates/),
[Android debug CA configuration](https://developer.android.com/privacy-and-security/security-config#Debug),
[Google Mobile Ads Charles guide](https://developers.google.com/ad-manager/mobile-ads-sdk/android/charles).

### SDK diagnostics

Diagnostics are **on** in this example. Every decision the SDK makes about a slot is one
`AUDZ …` line, and every action you take in the app is an `AUDZ app …` line, so a captured log
reads back as a sequence without you having to narrate it.

```bash
adb logcat -c && adb logcat -s AUDZ ReactNative ReactNativeJS flutter > audz.log     # Android
xcrun simctl spawn booted log stream --style compact \
  --predicate 'eventMessage CONTAINS "AUDZ"' > audz.log                              # iOS simulator
```

The line vocabulary is in
`../Audienzz Full Branch Audit 2026-09-20/Capturing Diagnostics.md`.

## Screens to test

The main screen combines remote banners, scroll-testing content and interstitial controls.
Separate Managed Banner, Managed Flows and Smart Refresh screens have been removed.

The Android example keeps content below the visible status bar and inside the navigation-bar
and display-cutout insets. Android 14 and below use the system's fitted window; Android 15+
uses root padding because edge-to-edge is enforced. Check the main screen and test-screen
back button in portrait and landscape, including after an interstitial closes. Google shows
interstitials in a separate `AdActivity`, so also verify its close button independently;
the example's root padding does not control Google's fullscreen layout.

| Flow                                            | Where                                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| RemoteBanner scrolling; scroll off and back     | **Main → Remote ads**: fixed banner 46 and adaptive banner 48, separated by article text |
| Background / foreground with a banner on screen | Main screen — background the app past the refresh interval, then return                    |
| Page A → B → A                                  | **Open test screen** below either banner, then **Back**                                    |
| Retained tabs                                   | **Other examples → Reload tabs**                                                           |
| Sticky banner                                   | **Other examples → Sticky ad**                                                             |
| Interstitial prefetch → show                    | **Main → Interstitial → Prefetch**, then **Show**                                          |
| Interstitial prefetchAndShow                    | **Main → Interstitial → Prefetch and show**                                                |
| Repeated taps / ineligible opportunity          | Same controls; use **Test ineligible opportunity** for a rejected show                     |
| Disposal during loading                         | Start **Prefetch**, then use a navigation button to leave the main screen                  |
| Older integration                               | **Other examples → Legacy (v0.3.8)**                                                       |

The viewport is judged by the native SDK. Use the `AUDZ` diagnostics to verify refresh holds and
requests; the example does not claim that a JavaScript visibility estimate is native refresh state.
Managed-page edge cases (same-name routes, delayed content, covers and durable pauses) remain
covered by the SDK's automated tests; they are no longer separate demo screens.

### What a good run looks like

When you open the test screen, the navigation diagnostic names `test` before its ad is created.
The main screen's banners are released and unmounted. On **Back**, navigation reports `main`
before its banners are created again; lazy slots wait until they are near the viewport.

While scrolling or backgrounding the app, check native `AUDZ` refresh diagnostics for holds and
subsequent recovery. A slot outside the eligible viewport must not start a periodic refresh.
If a slot stays empty, inspect the hold reason and whether its owning page matches the active page.
First check for configuration errors: an HTTP 404 for the publisher followed by
`Remote config not found` means no banner auction could start. With native Android 0.3.0, a successful
SDK initialization callback alone does not guarantee the remote configuration downloaded successfully.

## A note on `Podfile.lock`

`example/ios/Podfile.lock` is tracked and records the portable sibling checkout path.
Do not commit an absolute path when using an alternate checkout.
Keep it in sync with `Pods/Manifest.lock` by running `pod install` after changing sources.
Restoring only one lockfile causes Xcode's "sandbox is not in sync" build failure.

## Before releasing

1. Publish the native changes and update both library dependency pins.
2. Remove the example's `audienzzNativeVersion` property and restore the Podfile's released default.
3. Run `pod install`, rebuild both platforms against the published dependencies, and rerun the
   bridge suites. No local native source override should remain active in release verification.

## Published native fixes and analytics checks

Published Android `0.3.1` and iOS `0.4.1` include immediate analytics delivery
with persistent retries, page-impression attribution, adaptive banner fixes, and banner-only
slot numbering. iOS includes the HTTP-204 analytics fix and late adaptive-size notifications;
Android includes Prebid-outage fallback and foreground recovery after translucent interstitials.
This testing branch uses local native main for the newer changes. Rebuild and reinstall;
Metro reload does not replace the native SDKs.

For analytics checks, configure the device network proxy, enable SSL proxying for
`api.adnz.co:443`, and filter Charles for `/api/ws-clickstream-collector/submit/batch`.
The local native SDKs persist events and batch by auction after 2 seconds without new events.
The backend batch cap defaults to 10 and cannot exceed 15, with one request in flight.
With diagnostics enabled, they log
`AUDZ analytics queued/sending/sent/failed/retryScheduled/dropped` without event payloads.
`sent` confirms HTTP success, not dashboard ingestion.

### Android outage and repeated-interstitial checks

Block only the configured Prebid host in Charles, leaving the Audienzz configuration and Google
hosts reachable. Test both a cold launch and blocking after initialization. Remote banners and
interstitials must still reach Google; a timeout/error in Prebid must not become an empty slot
with no Google request. A Prebid initialization failure resolves with a warning and permits
Google-only demand. Retry initialization after restoring connectivity to restore Prebid too.
Missing remote configuration or a Google network failure is still a load failure.

Repeat **Prefetch → ready → Show → dismiss** at least three times without leaving the page.
Each cycle must load new inventory, show once and return to not-ready. Capture the full error
and `AUDZ interstitial` events if a show is skipped. The example displays structured errors.

A skipped show with `ready: true` keeps the prefetched ad. Pressing **Prefetch** again should
say **ready to show — using prefetched ad**, without another network request; **Show** can retry
at a later eligible opportunity. This is different from a load being stuck. If Android reports
`reason: inactive` after returning from an interstitial, verify that the APK includes the native
foreground fix above: use the configured local native main checkout and rebuild the APK.

The sticky example uses five `RemoteConfigBanner` instances with the same fixed placement as
the main screen. Lazy loading and prefetch distance come only from the backend (`lazyLoad`
defaults to `true`, `prefetchDistanceDp` to `200`); the example supplies no delivery overrides.
With those defaults, verify that distant slots wait until they approach the viewport to request.

It has labels above and below every loaded creative. They sample geometry every
500 ms and use the native top-edge/half-height thresholds. They describe viewport eligibility,
not whether a network refresh is currently running.

## RemoteBanner sizing checks

Production placement 46 allows both 300×250 and 320×50. Check both creatives, including a refresh
that switches between them: the ad must remain inside its slot without overlapping its title
or neighbouring text. The initial 300×250 example style reserves space; it does not restrict
the backend's list of sizes. Sticky slots must also follow the returned size.

Placement 48 currently sends `type: INLINE`, `widthStrategy: CUSTOM`, `customWidth: 320`.
That width is **320 dp**, not 320 physical pixels. Test at more than one device density and
verify the full creative height, horizontal centering, and lazy loading before first fill.
The custom-width/type fix is included in Android 0.3.1 and local native main.

For iOS inline banners, also test a size arriving after the load callback and a creative changing
height after display. The slot must retain its placeholder until a positive creative size arrives,
then update both UIKit and React Native layout without another auction or `onAdLoaded` event.
This uses the native iOS sizing fix in iOS 0.4.1 and local native main, plus the RN size-event bridge.

## ATT in the iOS example

The example requests ATT only when the app is active and status is `notDetermined`, before
initializing ads. RN does this in `example/ios/AppDeletage.swift`; Flutter does it in
`example/lib/main.dart`. Denied/restricted status still allows initialization and leaves IDFA
unavailable. Existing decisions are not prompted again. The SDK itself never prompts a
publisher's users; the host app owns its ATT/CMP flow and usage-description text.

Test a fresh install with Allow and Deny separately, plus relaunch and background/foreground.
A zero IDFA after Deny is expected; do not use it as proof that ad loading failed.

## Same-page interstitial return (unreleased)

Use current native `main` in both sibling checkouts and this wrapper branch. Published Android
0.3.1 / iOS 0.4.1 do not contain this policy yet; update pins after publication before releasing
these bridge changes.

- Show/dismiss three successive prefetched interstitials: one banner replacement per return,
  optional blanking until Google responds, no extra analytics `pageImpression`.
- Compare `page_impression_id`, `au_page_seq`, `au_slot`: unchanged; banner refresh count advances.
- Navigate during the ad, dismiss while backgrounded, and background/foreground before dismissal:
  no old-page revival or duplicate reload; no requests while covered/backgrounded.
- Keep a banner manually paused or off-screen: dismissal must not bypass either hold.
- Prefetch on A, show on B: interstitial events keep A; banner recovery belongs to B.

The existing bridge page callback is a view lifecycle notification, not evidence that an analytics
page event was sent. Inspect the collector payload separately.
