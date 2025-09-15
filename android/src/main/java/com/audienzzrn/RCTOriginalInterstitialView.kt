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

import android.content.Context
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.admanager.AdManagerInterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAd
import org.audienzz.mobile.AudienzzAdSize
import org.audienzz.mobile.AudienzzInterstitialAdUnit
import org.audienzz.mobile.original.AudienzzInterstitialAdHandler
import org.audienzz.mobile.original.callbacks.AudienzzFullScreenContentCallback
import org.audienzz.mobile.original.callbacks.AudienzzInterstitialAdLoadCallback
import org.audienzz.mobile.util.lazyAdLoader

class RCTOriginalInterstitialView(context: Context) : RCTOriginalView(context) {
  private var minSizesPercentage: List<Int> = listOf()
  private var sizes: Array<AudienzzAdSize> = arrayOf()
  private var auInterstitialView: AudienzzInterstitialAdUnit? = null
  private var mInterstitialAd: InterstitialAd? = null

  fun handleAdLoaded() {
    (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdLoaded", null)
  }

  fun handleAdFailedToLoad(loadError: LoadAdError) {
    val error: WritableMap = Arguments.createMap()
    error.putInt("code", loadError.code)
    error.putString("message", loadError.message)
    (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdFailedToLoad", error)
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

  override fun createAd() {
    super.createAd()

    auInterstitialView = AudienzzInterstitialAdUnit(
      auConfigID,
      AudienzzConversionUtils.convertToAudienzzAdFormats(adFormats)
    )
    val handler = AudienzzInterstitialAdHandler(
      auInterstitialView!!,
      adUnitID,
    )

    if (pbAdSlot != null) {
      auInterstitialView?.pbAdSlot = pbAdSlot
    }
    if (gpID != null) {
      auInterstitialView?.gpid = gpID
    }

    if(sizes.isNotEmpty()){
      bannerParameters.adSizes = sizes.toSet()
    }

    auInterstitialView?.bannerParameters = bannerParameters
    auInterstitialView?.videoParameters = videoParameters
    auInterstitialView?.impOrtbConfig = impOrtbConfig
    auInterstitialView?.setMinSizePercentage(minSizesPercentage[0], minSizesPercentage[1])

    val activity = (context as? ReactContext)?.currentActivity

    this.lazyAdLoader(
      adHandler = handler,
      adLoadCallback = object : AudienzzInterstitialAdLoadCallback() {
        override fun onAdLoaded(interstitialAd: AdManagerInterstitialAd) {
          mInterstitialAd = interstitialAd
          handleAdLoaded()
          if (activity != null) {
            mInterstitialAd?.show(activity)
          }
        }

        override fun onAdFailedToLoad(loadAdError: LoadAdError) {
          handleAdFailedToLoad(loadAdError)
        }
      },
      fullScreenContentCallback = object : AudienzzFullScreenContentCallback() {
        override fun onAdClicked() {
          handleAdClicked()
        }

        override fun onAdDismissedFullScreenContent() {
          handleAdClosed()
          mInterstitialAd = null
        }

        override fun onAdFailedToShowFullScreenContent(p0: AdError) {
          mInterstitialAd = null
        }

        override fun onAdShowedFullScreenContent() {
          handleAdOpened()
        }
  },
      resultCallback = { resultCode, request, listener ->
        AdManagerInterstitialAd.load(
          activity!!,
          adUnitID,
          request,
          listener,
        )
      }
    )
  }

  fun updateSizes(value: Array<AudienzzAdSize>) {
    sizes = value
  }

  fun updateMinSizesPercentage(value: List<Int>) {
    minSizesPercentage = value
  }
}
