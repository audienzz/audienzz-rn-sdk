package com.audienzz

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class RCTRemoteConfigInterstitialManager : SimpleViewManager<RCTRemoteConfigInterstitialView>() {
  override fun getName() = "RNRemoteConfigInterstitial"
  override fun createViewInstance(reactContext: ThemedReactContext) = RCTRemoteConfigInterstitialView(reactContext)
  override fun onAfterUpdateTransaction(view: RCTRemoteConfigInterstitialView) {
    super.onAfterUpdateTransaction(view)
    view.createAd()
  }
  override fun onDropViewInstance(view: RCTRemoteConfigInterstitialView) {
    view.dispose()
    super.onDropViewInstance(view)
  }
  override fun getCommandsMap() = mapOf("show" to 0, "preload" to 1, "showAtOpportunity" to 2, "dispose" to 3)
  override fun receiveCommand(view: RCTRemoteConfigInterstitialView, commandId: Int, args: ReadableArray?) {
    when (commandId) {
      0 -> view.show()
      1 -> view.preload()
      2 -> view.showAtOpportunity(args?.let { it.size() > 0 && it.getBoolean(0) } ?: false)
      3 -> view.dispose()
    }
  }
  override fun receiveCommand(view: RCTRemoteConfigInterstitialView, commandId: String, args: ReadableArray?) {
    getCommandsMap()[commandId]?.let { receiveCommand(view, it, args) }
  }
  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> =
    listOf("onAdLoaded", "onAdClicked", "onAdOpened", "onAdClosed", "onAdFailedToLoad",
      "onAdFailedToShow", "onAdImpression", "onLifecycleEvent")
      .associateWith { mapOf("registrationName" to it) }

  @ReactProp(name = "adConfigId")
  fun setAdConfigId(view: RCTRemoteConfigInterstitialView, value: String?) { view.setAdConfigId(value) }
  @ReactProp(name = "manualControl", defaultBoolean = false)
  fun setManualControl(view: RCTRemoteConfigInterstitialView, value: Boolean) { view.setManualControl(value) }
}
