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
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import org.audienzz.mobile.AudienzzRewardedVideoAdUnit

class RCTOriginalRewardedView(context: Context) : RCTOriginalView(context) {
  companion object {
    private var tagLogcat = "LOGCAT RCTOriginalRewardedView"
  }

  private var auRewardedView: AudienzzRewardedVideoAdUnit? = null

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

  private fun handleRewardEarned(type: String, amount: Int) {
    val event: WritableMap = Arguments.createMap()
    event.putString("type", type)
    event.putInt("amount", amount)

    (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onRewardEarned", event)
  }

  override fun createAd() {
    super.createAd()

    auRewardedView = AudienzzRewardedVideoAdUnit(auConfigID)

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
    if(appContent != null) {
      auRewardedView?.appContent = appContent
    }

    auRewardedView?.videoParameters = videoParameters

    auRewardedView?.fetchDemand(request) {
      RewardedAd.load(
        context,
        adUnitID,
        request,
        createListener()
      )
    }
  }

  private fun createListener(): RewardedAdLoadCallback {
    return object : RewardedAdLoadCallback() {
      override fun onAdLoaded(rewardedAd: RewardedAd) {
        super.onAdLoaded(rewardedAd)
        val activity = (context as? ReactContext)?.currentActivity

        handleAdLoaded()

        if (activity != null) {
          rewardedAd.show(activity) { rewardItem ->
            val rewardAmount = rewardItem.amount
            val rewardType = rewardItem.type

            handleRewardEarned(rewardType, rewardAmount)
          }
        } else {
          Log.e(tagLogcat, "Context is not an Activity, cannot show ad")
        }
      }

      override fun onAdFailedToLoad(loadAdError: LoadAdError) {
        Log.e(tagLogcat, "Ad failed to load: $loadAdError")
        handleAdFailedToLoad(loadAdError)
      }
    }
  }
}
