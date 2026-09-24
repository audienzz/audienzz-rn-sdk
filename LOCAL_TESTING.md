# Running this example against the LOCAL native SDKs

The bridge and example use published `com.audienzz:sdk:0.3.0` and
`AudienzziOSSDK ~> 0.4.0` by default. No native checkout is needed for normal builds.
The overrides below are optional and only for developing native changes.

The example's endpoint, publisher and placement IDs live together in `example/src/remoteConfig.ts`.
It uses production publisher **35**, fixed banner **46**, adaptive banner **48**, and interstitial
**47** on both platforms. Android SDK 0.3.0 always fetches configuration from production; it cannot
use the development publisher **81** or placements **118/192/267**. The bridge rejects unsupported
URLs instead of silently sending those IDs to production.

## Android — one Gradle property

Publish the native SDK to your local Maven repository once:

```bash
cd ~/Documents/audienzz-android-sdk
sed -i '' 's/audienzzSdkVersion = "0.3.0"/audienzzSdkVersion = "0.3.0-local"/' Audienzz/build.gradle.kts
./gradlew :Audienzz:publishToMavenLocal
```

After publishing a local build, add this temporary override to `example/android/gradle.properties`
(or pass `-PaudienzzNativeVersion=0.3.0-local` when invoking Gradle):

```properties
audienzzNativeVersion=0.3.0-local
```

That property is what switches `android/build.gradle` over and adds `mavenLocal()`. **Delete the
line to go back to the published pin**, and before releasing — the default in `android/build.gradle`
is `0.3.0`, so nothing about the shipped package depends on it.

Re-publish after every native change; Gradle caches by version, so either re-publish over
`0.3.0-local` or bump the suffix.

## iOS — one environment variable

```bash
export AUDIENZZ_IOS_SDK_PATH=~/Documents/audienzz-ios-sdk
cd audienzz-rn-sdk/example/ios && pod install
```

To go back:

```bash
unset AUDIENZZ_IOS_SDK_PATH
cd audienzz-rn-sdk/example/ios && pod install
```

`pod install` prints when it uses the local checkout. The environment variable lets you switch
sources without editing the committed `Podfile`; the generated lockfile records the selected source.

## Run

```bash
yarn ios / yarn android
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

Running `pod install` with `AUDIENZZ_IOS_SDK_PATH` set rewrites `example/ios/Podfile.lock` to point
at your checkout, so the file will show as modified while you are testing. **Do not commit it** —
an absolute path in a tracked lock only resolves on one machine. `git checkout -- example/ios/Podfile.lock`
puts it back; the installed Pods are unaffected.

## Before releasing

1. Delete `audienzzNativeVersion` from `example/android/gradle.properties`.
2. `unset AUDIENZZ_IOS_SDK_PATH` and `pod install`.
3. Build both platforms against the published dependencies. The current required releases are
   Android 0.3.0 and iOS 0.4.0; no local override should be active.
