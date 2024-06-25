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
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.admanager.AdManagerInterstitialAd
import com.google.android.gms.ads.admanager.AdManagerInterstitialAdLoadCallback
import org.audienzz.mobile.AudienzzInterstitialAdUnit

class RCTOriginalInterstitialView(context: Context) : RCTOriginalView(context) {
  companion object {
    private var tagLogcat = "LOGCAT RCTInterstitialView"
  }

  private var minSizesPercentage: List<Int> = listOf()
  private var auInterstitialView: AudienzzInterstitialAdUnit? = null

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
      AdManagerInterstitialAd.load(
        context,
        adUnitID,
        request,
        createListener()
      )
    }
  }

  private fun createListener(): AdManagerInterstitialAdLoadCallback {
    return object : AdManagerInterstitialAdLoadCallback() {

      override fun onAdLoaded(adManagerInterstitialAd: AdManagerInterstitialAd) {
        super.onAdLoaded(adManagerInterstitialAd)
        val activity = (context as? ReactContext)?.currentActivity

        handleAdLoaded()

        if (activity != null) {
          adManagerInterstitialAd.show(activity)
        } else {
          Log.e(tagLogcat, "Context is not an Activity, cannot show ad")
        }
      }

      override fun onAdFailedToLoad(loadAdError: LoadAdError) {
        super.onAdFailedToLoad(loadAdError)
        Log.e(tagLogcat, "Ad failed to load: $loadAdError")
        handleAdFailedToLoad(loadAdError)
      }
    }
  }

  fun updateMinSizesPercentage(value: List<Int>) {
    minSizesPercentage = value;
  }
}
