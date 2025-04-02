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
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.rewarded.RewardItem
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import org.audienzz.mobile.AudienzzRewardedVideoAdUnit
import org.audienzz.mobile.original.AudienzzRewardedVideoAdHandler
import org.audienzz.mobile.util.lazyLoadAd
import org.audienzz.mobile.util.AudienzzFullScreenContentCallback

class RCTOriginalRewardedView(context: Context) : RCTOriginalView(context) {
  private var auRewardedView: AudienzzRewardedVideoAdUnit? = null
  private var rewardedAd: RewardedAd? = null
  private lateinit var reward: RewardItem

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

  override fun createAd() {
    super.createAd()

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
    if (keyword != null) {
      auRewardedView?.addExtKeyword(keyword!!)
    }
    if (keywords != null) {
      auRewardedView?.addExtKeywords(keywords!!)
    }
    if (appContent != null) {
      auRewardedView?.appContent = appContent
    }

    auRewardedView?.videoParameters = videoParameters

    val activity = (context as? ReactContext)?.currentActivity

    this.lazyLoadAd(
      adHandler = handler,
      listener = object : RewardedAdLoadCallback() {
        override fun onAdLoaded(ad: RewardedAd) {
          rewardedAd = ad
          rewardedAd?.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdClicked() {
              handleAdClicked()
            }

            override fun onAdDismissedFullScreenContent() {
              val rewardAmount = reward.amount
              val rewardType = reward.type

              handleAdClosed(rewardType, rewardAmount)

              rewardedAd = null
            }

            override fun onAdFailedToShowFullScreenContent(p0: AdError) {
              rewardedAd = null
            }

            override fun onAdImpression() {}

            override fun onAdShowedFullScreenContent() {
              handleAdOpened()
            }
          }

          handleAdLoaded()

          if (activity != null) {
            rewardedAd!!.show(activity) { rewardItem ->
              reward = rewardItem
            }
          }
        }

        override fun onAdFailedToLoad(loadAdError: LoadAdError) {
          handleAdFailedToLoad(loadAdError)
        }
      },
      resultCallback = {},
      manager = AudienzzFullScreenContentCallback(),
      requestCallback = { request, listener ->
        RewardedAd.load(
          activity!!,
          adUnitID,
          request,
          listener,
        )
      },
    )
  }
}
