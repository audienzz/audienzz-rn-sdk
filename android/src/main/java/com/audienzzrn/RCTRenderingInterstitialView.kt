package com.audienzz

/*
    Copyright 2024 Audienzz AG

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

import android.content.Context
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import org.audienzz.mobile.AudienzzAdSize
import org.audienzz.mobile.api.exceptions.AudienzzAdException
import org.audienzz.mobile.api.rendering.AudienzzInterstitialAdUnit
import org.audienzz.mobile.api.rendering.listeners.AudienzzInterstitialAdUnitListener
import org.audienzz.mobile.eventhandlers.AudienzzGamInterstitialEventHandler
import org.audienzz.mobile.util.addOnBecameVisibleOnScreenListener

class RCTRenderingInterstitialView(context: Context) : RCTOriginalView(context) {
  private var adFormat: String = ""
  private var skipDelay: Int = 0
  private var minSizesPercentage: List<Int> = listOf()

  private var auInterstitialView: AudienzzInterstitialAdUnit? = null

  fun handleAdLoaded() {
    (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdLoaded", null)
  }

  fun handleAdClicked() {
    (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdClicked", null)
  }

  fun handleAdOpened() {
    (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdOpened", null)
  }

  fun handleAdClosed() {
    (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdClosed", null)
  }

  fun handleAdFailedToLoad(loadError: AudienzzAdException?) {
    val error: WritableMap = Arguments.createMap()
    error.putInt("code", 0)
    error.putString("message", loadError?.message)
    (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdFailedToLoad", error)
  }

  override fun createAd() {
    super.createAd()

    val currentActivity = (context as ReactContext).currentActivity
    val eventHandler = AudienzzGamInterstitialEventHandler(currentActivity!!, adUnitID)

    auInterstitialView = AudienzzInterstitialAdUnit(
      currentActivity, auConfigID, AudienzzConversionUtils.convertToAudienzzAdFormat(adFormat), eventHandler
    )

    if (pbAdSlot != null) {
      auInterstitialView?.pbAdSlot = pbAdSlot
    }
    if (keyword != null) {
      auInterstitialView?.addExtKeyword(keyword!!)
    }
    if (keywords != null) {
      auInterstitialView?.addExtKeywords(keywords!!)
    }
    if (appContent != null) {
      auInterstitialView?.appContent = appContent
    }

    auInterstitialView?.setSkipDelay(skipDelay)

    auInterstitialView?.setMinSizePercentage(
      AudienzzAdSize(
        minSizesPercentage[0],
        minSizesPercentage[1]
      )
    )

    auInterstitialView?.setInterstitialAdUnitListener(object :
      AudienzzInterstitialAdUnitListener {
      override fun onAdLoaded(interstitialAdUnit: AudienzzInterstitialAdUnit) {
        handleAdLoaded()
        interstitialAdUnit.show()
      }

      override fun onAdDisplayed(interstitialAdUnit: AudienzzInterstitialAdUnit) {
        handleAdOpened()
      }

      override fun onAdFailed(
        interstitialAdUnit: AudienzzInterstitialAdUnit,
        exception: AudienzzAdException?
      ) {
        handleAdFailedToLoad(exception)
      }

      override fun onAdClicked(interstitialAdUnit: AudienzzInterstitialAdUnit) {
        handleAdClicked()
      }

      override fun onAdClosed(interstitialAdUnit: AudienzzInterstitialAdUnit) {
        handleAdClosed()
      }
    })

   this.addOnBecameVisibleOnScreenListener {
     auInterstitialView?.loadAd()
   }
  }

  fun updateAdFormat(value: String) {
    adFormat = value
  }

  fun updateSkipDelay(value: Int) {
    skipDelay = value
  }

  fun updateMinSizesPercentage(value: List<Int>) {
    minSizesPercentage = value;
  }
}
