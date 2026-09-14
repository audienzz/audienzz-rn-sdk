package com.audienzz

import android.content.Context
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.LoadAdError
import org.audienzz.mobile.AudienzzRemoteConfigInterstitial

class RCTRemoteConfigInterstitialView(context: Context) : RCTOriginalView(context) {
  internal var interstitialFactory: (Context, String, AudienzzRemoteConfigInterstitial.Events) -> AudienzzRemoteConfigInterstitial =
    { host, config, events -> AudienzzRemoteConfigInterstitial(host, config, events) }
  private var adConfigId: String? = null
  private var manualControl = false
  private var appliedConfig: Pair<String, Boolean>? = null
  private var remoteInterstitial: AudienzzRemoteConfigInterstitial? = null
  private var generation = 0
  private var disposed = false
  private var presentationPhase = false

  fun setAdConfigId(value: String?) { adConfigId = value }
  fun setManualControl(value: Boolean) { manualControl = value }

  private fun emit(name: String, payload: WritableMap? = null) {
    if (!disposed) (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, name, payload)
  }

  private fun error(name: String, code: Int, message: String, domain: String) {
    emit(name, Arguments.createMap().apply {
      putInt("code", code); putString("message", message); putString("domain", domain)
    })
  }

  override fun createAd() {
    if (disposed) return
    val config = adConfigId?.takeIf { it.isNotBlank() }?.let { it to manualControl }
    if (config == appliedConfig) return
    generation++ // Invalidate callbacks before destroy, which can complete pending work.
    remoteInterstitial?.destroy()
    remoteInterstitial = null
    appliedConfig = config
    presentationPhase = false
    if (config == null) return
    val token = generation
    remoteInterstitial = interstitialFactory(
       (context as ReactContext).currentActivity ?: context,
      config.first,
      object : AudienzzRemoteConfigInterstitial.Events {
        private fun current() = !disposed && token == generation
        override fun onLoaded() { if (current()) emit("onAdLoaded") }
        override fun onFailed(loadError: LoadAdError) {
          if (current()) error("onAdFailedToLoad", loadError.code, loadError.message, loadError.domain)
        }
        override fun onOpened() { if (current()) emit("onAdOpened") }
        override fun onClosed() { if (current()) emit("onAdClosed") }
        override fun onClicked() { if (current()) emit("onAdClicked") }
        override fun onFailedToShow(adError: AdError) {
          if (current()) error("onAdFailedToShow", adError.code, adError.message, adError.domain)
        }
        override fun onError(reason: String) {
          if (current()) error(if (presentationPhase) "onAdFailedToShow" else "onAdFailedToLoad",
            -1, reason, "Audienzz")
        }
        override fun onLifecycleEvent(event: Map<String, Any?>) {
          if (!current()) return
          when (event["event"]) {
            "loadRequested" -> presentationPhase = false
            "loaded", "showAttempted", "showFailed" -> presentationPhase = true
            "impression" -> emit("onAdImpression")
          }
          emit("onLifecycleEvent", Arguments.makeNativeMap(event))
        }
      }
    )
    if (!manualControl) remoteInterstitial?.loadAd()
  }

  fun preload() {
    if (disposed || !manualControl) return
    remoteInterstitial?.preload()
  }

  fun showAtOpportunity(eligible: Boolean) {
    if (disposed || !manualControl) return
    showOnce(eligible)
  }

  fun show() { if (!disposed) showOnce(true) }

  private fun showOnce(eligible: Boolean) {
    val activity = (context as ReactContext).currentActivity
    if (activity == null) {
      emit("onLifecycleEvent", Arguments.createMap().apply {
        putString("event", "opportunitySkipped"); putString("reason", "inactive")
        putString("configId", adConfigId)
      })
      return
    }
    remoteInterstitial?.showAtOpportunity(activity, eligible)
  }

  fun dispose() {
    if (disposed) return
    disposed = true
    generation++
    remoteInterstitial?.destroy()
    remoteInterstitial = null
  }
}
