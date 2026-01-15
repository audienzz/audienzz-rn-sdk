package com.audienzz

/*
    Copyright 2025 Audienzz AG
*/

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.LoadAdError
import org.audienzz.mobile.AudienzzRemoteConfigInterstitial

class RCTRemoteConfigInterstitialView(
  context: Context
) : RCTOriginalView(context) {

  private var adConfigId: String? = null
  private var remoteInterstitial: AudienzzRemoteConfigInterstitial? = null

  fun setAdConfigId(value: String?) {
    adConfigId = value
  }

  private fun handleAdLoaded() {
    (context as ReactContext)
      .getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdLoaded", null)
  }

  private fun handleAdFailedToLoad(loadError: LoadAdError) {
    val error: WritableMap = Arguments.createMap()
    error.putInt("code", loadError.code)
    error.putString("message", loadError.message)

    (context as ReactContext)
      .getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdFailedToLoad", error)
  }

  private fun handleAdClicked() {
    (context as ReactContext)
      .getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdClicked", null)
  }

  private fun handleAdOpened() {
    (context as ReactContext)
      .getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdOpened", null)
  }

  private fun handleAdClosed() {
    (context as ReactContext)
      .getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdClosed", null)
  }

  override fun createAd() {
    super.createAd()

    val configId = adConfigId
    if (configId.isNullOrBlank()) {
      return
    }

    val activity = (context as? ReactContext)?.currentActivity

    remoteInterstitial = AudienzzRemoteConfigInterstitial(
      context = activity!!,
      configId = configId,
      events = object : AudienzzRemoteConfigInterstitial.Events {

        override fun onLoaded() {
          handleAdLoaded()
        }

        override fun onFailed(loadError: LoadAdError) {
          handleAdFailedToLoad(loadError)
        }

        override fun onOpened() {
          handleAdOpened()
        }

        override fun onClosed() {
          handleAdClosed()
        }

        override fun onClicked() {
          handleAdClicked()
        }

        override fun onFailedToShow(adError: AdError) {
          // Nothing to handle
        }
      }
    )

    remoteInterstitial?.loadAd()
  }
}
