package com.audienzz

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

  @ReactProp(name = "adConfigId")
  fun setAdConfigId(view: RCTRemoteConfigBannerView, value: String) {
    view.updateConfigId(value)
  }

  override fun onAfterUpdateTransaction(view: RCTRemoteConfigBannerView) {
    super.onAfterUpdateTransaction(view)
    view.loadAd()
  }

  override fun onDropViewInstance(view: RCTRemoteConfigBannerView) {
    super.onDropViewInstance(view)
    view.destroy()
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


