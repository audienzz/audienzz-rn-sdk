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
  private val requestContext = org.audienzz.mobile.targeting.AudienzzAdRequestContext()
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
    releaseOwner("replaced")
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
          // A discard is emitted during teardown, after the generation bump that silences load and
          // presentation callbacks. Gating it away swallowed exactly the event this teardown
          // should surface, so it is allowed through on its own terms.
          val isDiscard = event["event"] == "discardedWithoutImpression"
          if (!current() && !isDiscard) return
          when (event["event"]) {
            "loadRequested" -> presentationPhase = false
            "loaded", "showAttempted", "showFailed" -> presentationPhase = true
            "impression" -> emit("onAdImpression")
          }
          emit("onLifecycleEvent", Arguments.makeNativeMap(event))
        }
      }
    )
    // manualControl == false means "prefetch and show as soon as this component mounts": the
    // convenience form, spelled out rather than hidden behind a load that sometimes presents.
    remoteInterstitial?.requestContext = requestContext
    if (!manualControl) remoteInterstitial?.prefetchAndShow()
  }

  fun prefetch() {
    if (disposed) return
    remoteInterstitial?.prefetch()
  }

  fun prefetchAndShow() {
    if (disposed) return
    remoteInterstitial?.prefetchAndShow()
  }

  fun show(eligible: Boolean) { if (!disposed) showOnce(eligible) }

  private fun showOnce(eligible: Boolean) {
    val activity = (context as ReactContext).currentActivity
    if (activity == null) {
      emit("onLifecycleEvent", Arguments.createMap().apply {
        putString("event", "opportunitySkipped"); putString("reason", "inactive")
        putString("configId", adConfigId)
      })
      return
    }
    remoteInterstitial?.show(activity, eligible)
  }

  fun dispose() {
    if (disposed) return
    releaseOwner("disposed")
    disposed = true
  }

  /**
   * Releases the placement owner, recording why: a prop change that swaps placements is a
   * replacement, an unmount is a disposal. Only the reported reason differs.
   *
   * The generation bump stops load and presentation callbacks reaching JS as spurious failures —
   * every one of them is generation-gated. But destroy() is also what reports inventory discarded
   * without an impression, and gating that away swallowed exactly the event this teardown should
   * surface, so the discard is forwarded directly instead.
   */
  private fun releaseOwner(reason: String) {
    val owner = remoteInterstitial
    generation++
    remoteInterstitial = null
    owner?.destroy(reason)
  }
}
