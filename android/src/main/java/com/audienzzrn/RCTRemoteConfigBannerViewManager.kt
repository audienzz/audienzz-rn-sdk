package com.audienzz

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class RCTRemoteConfigBannerViewManager : SimpleViewManager<RCTRemoteConfigBannerView>() {

  override fun getName(): String {
    return "RNRemoteConfigBanner"
  }

  override fun createViewInstance(reactContext: ThemedReactContext): RCTRemoteConfigBannerView {
    return RCTRemoteConfigBannerView(reactContext)
  }

  @ReactProp(name = "pageKey")
  fun setPageKey(view: RCTRemoteConfigBannerView, value: String?) {
    view.updatePageKey(value)
  }

  @ReactProp(name = "adConfigId")
  fun setAdConfigId(view: RCTRemoteConfigBannerView, value: String) {
    view.updateConfigId(value)
  }

  @ReactProp(name = "adWidth", defaultInt = 0)
  fun setAdWidth(view: RCTRemoteConfigBannerView, value: Int) {
    view.updateAdWidth(value)
  }

  @ReactProp(name = "adHeight", defaultInt = 0)
  fun setAdHeight(view: RCTRemoteConfigBannerView, value: Int) {
    view.updateAdHeight(value)
  }

  override fun onAfterUpdateTransaction(view: RCTRemoteConfigBannerView) {
    super.onAfterUpdateTransaction(view)
    view.loadAd()
  }

  override fun onDropViewInstance(view: RCTRemoteConfigBannerView) {
    super.onDropViewInstance(view)
    view.destroy()
  }

  override fun receiveCommand(view: RCTRemoteConfigBannerView, commandId: Int, args: ReadableArray?) {
    when (commandId) {
      0 -> view.stopAutoRefresh()
      1 -> view.resumeAutoRefresh()
      2 -> view.reloadIfVisible()
      3 -> view.setCovered(args?.getBoolean(0) ?: false)
    }
  }

  // Command names are resolved by name on the JS side (getViewManagerConfig().Commands.<name>),
  // so the numeric ids only need to be stable within this manager.
  override fun getCommandsMap(): Map<String, Int> {
    return mapOf(
      "stopAutoRefresh" to 0,
      "resumeAutoRefresh" to 1,
      "reload" to 2,
      "setCovered" to 3,
    )
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
    fun eventMap(eventName: String) = mapOf("registrationName" to eventName)

    return mapOf(
      "onAdLoaded" to eventMap("onAdLoaded"),
      "onAdClicked" to eventMap("onAdClicked"),
      "onAdClosed" to eventMap("onAdClosed"),
      "onAdFailedToLoad" to eventMap("onAdFailedToLoad")
    )
  }
}
