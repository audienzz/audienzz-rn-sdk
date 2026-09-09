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
import com.google.android.gms.ads.rewarded.RewardItem
import com.google.android.gms.ads.rewarded.RewardedAd
import org.audienzz.mobile.AudienzzRewardedVideoAdUnit
import org.audienzz.mobile.original.AudienzzRewardedVideoAdHandler
import org.audienzz.mobile.original.callbacks.AudienzzFullScreenContentCallback
import org.audienzz.mobile.original.callbacks.AudienzzRewardedAdLoadCallback
import org.audienzz.mobile.util.lazyAdLoader

class RCTOriginalRewardedView(context: Context) : RCTOriginalView(context) {
  private var auRewardedView: AudienzzRewardedVideoAdUnit? = null
  private var rewardedAd: RewardedAd? = null
  private var reward: RewardItem? = null

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

  private fun handleAdClosed(type: String, amount: Int) {
    val event: WritableMap = Arguments.createMap()
    event.putString("type", type)
    event.putInt("amount", amount)

    (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdClosed", event)
  }

  fun handleAdClicked() {
    (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdClicked", null)
  }

  fun handleAdOpened() {
    (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdOpened", null)
  }

  private fun handleAdFailedToShow(adError: AdError) {
    val error: WritableMap = Arguments.createMap()
    error.putInt("code", adError.code)
    error.putString("message", adError.message)
    (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdFailedToShow", error)
  }

  private fun emitFailedToLoad(code: Int, message: String) {
    val error: WritableMap = Arguments.createMap()
    error.putInt("code", code)
    error.putString("message", message)
    (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdFailedToLoad", error)
  }

  override fun createAd() {
    super.createAd()

    // H6: resolve the Activity once, up front. If it is gone (app backgrounded during load),
    // report a load failure instead of force-unwrapping it later and crashing.
    val activity = (context as? ReactContext)?.currentActivity
    if (activity == null) {
      emitFailedToLoad(-1, "No foreground Activity available to load the rewarded ad")
      return
    }

    auRewardedView = AudienzzRewardedVideoAdUnit(auConfigID)
    val handler = AudienzzRewardedVideoAdHandler(
      auRewardedView!!,
      adUnitID,
    )

    if (pbAdSlot != null) {
      auRewardedView?.pbAdSlot = pbAdSlot
    }
    if (gpID != null) {
      auRewardedView?.gpid = gpID
    }

    auRewardedView?.impOrtbConfig = impOrtbConfig
    auRewardedView?.videoParameters = videoParameters

    this.lazyAdLoader(
      adHandler = handler,
      adLoadCallback = object : AudienzzRewardedAdLoadCallback() {
        override fun onAdLoaded(ad: RewardedAd) {
          rewardedAd = ad

          handleAdLoaded()

          rewardedAd?.show(activity) { rewardItem ->
            reward = rewardItem
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
          // H6: the user can dismiss without earning a reward, in which case `reward` was never
          // set. Fall back to a zero reward instead of crashing on an uninitialized property.
          val earned = reward
          handleAdClosed(earned?.type ?: "", earned?.amount ?: 0)

          reward = null
          rewardedAd = null
        }

        override fun onAdFailedToShowFullScreenContent(adError: AdError) {
          // H8: surface show failures to JS instead of silently nulling the ad.
          handleAdFailedToShow(adError)
          rewardedAd = null
        }

        override fun onAdShowedFullScreenContent() {
          handleAdOpened()
        }
      },
      resultCallback = { resultCode, request, listener ->
        RewardedAd.load(
          activity,
          adUnitID,
          request,
          listener,
        )
      },
    )
  }
}
