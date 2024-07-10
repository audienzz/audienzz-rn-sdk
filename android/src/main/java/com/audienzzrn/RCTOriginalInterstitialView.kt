package com.audienzzrn

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
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import org.audienzz.mobile.AudienzzInterstitialAdUnit

class RCTOriginalInterstitialView(context: Context) : RCTOriginalView(context) {
  private var minSizesPercentage: List<Int> = listOf()
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

    if (pbAdSlot != null) {
      auInterstitialView?.pbAdSlot = pbAdSlot
    }
    if (gpID != null) {
      auInterstitialView?.gpid = gpID
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

    auInterstitialView?.bannerParameters = bannerParameters
    auInterstitialView?.videoParameters = videoParameters
    auInterstitialView?.setMinSizePercentage(minSizesPercentage[0], minSizesPercentage[1])

    auInterstitialView?.fetchDemand(request) {
      InterstitialAd.load(
        context,
        adUnitID,
        request,
        createListener()
      )
    }
  }

  private fun createListener(): InterstitialAdLoadCallback {
    return object : InterstitialAdLoadCallback() {

      override fun onAdLoaded(interstitialAd: InterstitialAd) {
        val activity = (context as? ReactContext)?.currentActivity

        mInterstitialAd = interstitialAd
        mInterstitialAd?.fullScreenContentCallback = object : FullScreenContentCallback() {
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

          override fun onAdImpression() {}

          override fun onAdShowedFullScreenContent() {
            handleAdOpened()
          }
        }

        handleAdLoaded()

        if (activity != null) {
          interstitialAd.show(activity)
        }
      }

      override fun onAdFailedToLoad(loadAdError: LoadAdError) {
        handleAdFailedToLoad(loadAdError)
      }
    }
  }

  fun updateMinSizesPercentage(value: List<Int>) {
    minSizesPercentage = value;
  }
}
