package com.audienzz

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

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.google.android.gms.ads.MobileAds
import org.audienzz.mobile.AudienzzPrebidMobile
import org.audienzz.mobile.AudienzzTargetingParams
import org.audienzz.mobile.api.data.AudienzzInitializationStatus
import org.audienzz.mobile.util.remote.RemoteConfigManager

private const val RN_SDK_VERSION = "0.4.4"

class RNAudienzzModule(reactContext: ReactApplicationContext) :
  ReactNativeModule(reactContext, SERVICE) {
  @ReactMethod
  fun initialize(companyID: String, promise: Promise) {
    AudienzzPrebidMobile.initializeSdk(applicationContext, companyID) { status ->
      when (status) {
        AudienzzInitializationStatus.SUCCEEDED -> {
          setupOmid()
          setupRnSdkIdentity()
          val result: WritableMap =
            Arguments.createMap().apply {
              putString("status", "SUCCEEDED")
              putString("description", "SDK initialized successfully!")
            }

          promise.resolve(result)
        }

        else -> {
          Log.e(TAG, "SDK initialization error: $status\n${status.description}")
        }
      }
    }
  }

  private fun setupOmid() {
    val v = MobileAds.getVersion()
    AudienzzTargetingParams.omidPartnerName = "Google"
    AudienzzTargetingParams.omidPartnerVersion = "${v.majorVersion}.${v.minorVersion}.${v.microVersion}"
  }

  private fun setupRnSdkIdentity() {
    AudienzzTargetingParams.setBridgeTargeting("au_rn_v", RN_SDK_VERSION)
  }

  /**
   * Supply a publisher-owned PPID (e.g. a hashed e-mail). Takes precedence over the SDK-generated
   * one; pass null to clear and fall back to it. A PPID is always sent — there is no opt-out.
   */
  @ReactMethod
  fun setPublisherPpid(ppid: String?) {
    AudienzzPrebidMobile.ppidManager?.setPublisherPpid(ppid)
  }

  @ReactMethod
  fun getPpid(promise: Promise) {
    promise.resolve(AudienzzPrebidMobile.ppidManager?.getPpid())
  }

  @ReactMethod
  fun setSchainObject(schain: String) {
    AudienzzPrebidMobile.setSchainObject(schain)
  }

  /** One greppable AUDZ line per slot decision; see AudienzzDiagnostics. */
  @ReactMethod
  fun setDiagnosticsEnabled(enabled: Boolean) {
    AudienzzPrebidMobile.diagnosticsEnabled = enabled
  }

  /**
   * Force smart-refresh v2 on/off, overriding the backend `smartRefreshV2` config for the session.
   * v2 uses the directional viewport gate; v1 uses the legacy >=20%-visible gate.
   */
  @ReactMethod
  fun setSmartRefreshV2Enabled(enabled: Boolean) {
    AudienzzPrebidMobile.smartRefreshV2Override = enabled
  }

  /** When true, a banner blanks its slot during a screen-resume reload. */
  @ReactMethod
  fun setBlankOnScreenReload(enabled: Boolean) {
    AudienzzPrebidMobile.blankOnScreenReload = enabled
  }

  /** Global GMA ad audio volume for all ad types. Clamped to [0,1]; 0 = muted. */
  @ReactMethod
  fun setAppVolume(volume: Float) {
    AudienzzPrebidMobile.setAppVolume(volume.coerceIn(0f, 1f))
  }

  /**
   * Report an ad-bearing screen, dialog, or popup by name (your JS navigation route). Fires a
   * `pageImpression` and starts a fresh page-impression id that ties all ad events on this screen
   * visit together. Call on each navigation to an ad-bearing screen.
   */
  @ReactMethod
  fun pageImpression(name: String) {
    AudienzzPrebidMobile.pageImpression(name)
  }

  /**
   * Report a page whose identity and analytics name differ. Every React Native ad lives in the one
   * host Activity, so host identity can never separate two routes — the id is the only thing that
   * can, and a screen name repeats (two articles are both "article").
   */
  @ReactMethod
  fun pageImpressionWithId(pageId: String, name: String) {
    AudienzzPrebidMobile.pageImpression(pageId, name)
  }

  /**
   * Our own registration, so teardown removes ONLY ours and never someone else's.
   *
   * Forwards every native page impression to JS -- including the automatic one fired on returning
   * to the foreground, which never passes through the JS API. Native owns foreground reporting; JS
   * just page-scopes the ad types the native coordinator doesn't track (rendering banners).
   */
  private var pageImpressionObserver: ((String) -> Unit)? = { name ->
    reactContext
      .getJSModule(com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(PAGE_IMPRESSION_EVENT, name)
  }

  init {
    AudienzzPrebidMobile.pageImpressionObserver = pageImpressionObserver
  }

  override fun invalidate() {
    // The observer is a process-global singleton capturing the ReactApplicationContext. Without
    // this, destroying the React instance leaves that context retained and later page impressions
    // still emitting into a dead bridge.
    if (AudienzzPrebidMobile.pageImpressionObserver === pageImpressionObserver) {
      AudienzzPrebidMobile.pageImpressionObserver = null
    }
    pageImpressionObserver = null
    super.invalidate()
  }

  @ReactMethod
  fun configureRemote(remoteUrl: String, publisherId: String, promise: Promise) {
    try {
      RemoteConfigManager.initialize(
        publisherId = publisherId,
        remoteUrl = remoteUrl
      )
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("CONFIGURE_REMOTE_FAILED", e.message, e)
    }
  }

  @ReactMethod
  fun fetchPublisherConfig(publisherId: String, promise: Promise) {
    AudienzzPrebidMobile.initializeRemoteSdk(
      applicationContext,
      publisherId
    ) { status ->
      if (status == AudienzzInitializationStatus.SUCCEEDED) {
        setupOmid()
        setupRnSdkIdentity()
        promise.resolve(null)
      } else {
        val description = status.description ?: "Remote configuration fetch failed"
        promise.reject("FETCH_FAILED", description)
      }
    }
  }

  @ReactMethod
  fun getStickyConfig(adConfigId: String, promise: Promise) {
    AudienzzPrebidMobile.getAdUnitConfig(adConfigId) { config ->
      val result = Arguments.createMap().apply {
        putInt("maxHeight", config?.config?.stickyMaxHeight ?: 600)
        putInt("stickyTopOffset", config?.config?.stickyTopOffset ?: 0)
      }
      promise.resolve(result)
    }
  }

  companion object {
    private const val SERVICE = "RNAudienzzModule"
    private const val TAG = "AudienzzSDKInitializer"

    /** Device event carrying the page name of every native page impression. */
    const val PAGE_IMPRESSION_EVENT = "AudienzzPageImpression"
  }
}
