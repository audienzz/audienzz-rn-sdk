package com.audienzz

import android.os.Handler
import android.os.Looper
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class RCTRemoteConfigInterstitialManager :
  SimpleViewManager<RCTRemoteConfigInterstitialView>() {

  override fun getName(): String = "RNRemoteConfigInterstitial"

  override fun createViewInstance(
    reactContext: ThemedReactContext
  ): RCTRemoteConfigInterstitialView {
    return RCTRemoteConfigInterstitialView(reactContext)
  }

  override fun onAfterUpdateTransaction(view: RCTRemoteConfigInterstitialView) {
    super.onAfterUpdateTransaction(view)

    Handler(Looper.getMainLooper()).postDelayed({
      view.createAd()
    }, 1100)
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
    fun eventMap(eventName: String) = mapOf("registrationName" to eventName)

    return mapOf(
      "onAdLoaded" to eventMap("onAdLoaded"),
      "onAdClicked" to eventMap("onAdClicked"),
      "onAdOpened" to eventMap("onAdOpened"),
      "onAdClosed" to eventMap("onAdClosed"),
      "onAdFailedToLoad" to eventMap("onAdFailedToLoad")
    )
  }

  @ReactProp(name = "adConfigId")
  fun setAdConfigId(view: RCTRemoteConfigInterstitialView, value: String?) {
    view.setAdConfigId(value)
  }
}
