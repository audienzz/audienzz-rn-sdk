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
import org.audienzz.mobile.AudienzzReward
import org.audienzz.mobile.api.exceptions.AudienzzAdException
import org.audienzz.mobile.api.rendering.AudienzzRewardedAdUnit
import org.audienzz.mobile.api.rendering.listeners.AudienzzRewardedAdUnitListener
import org.audienzz.mobile.eventhandlers.AudienzzGamRewardedEventHandler
import org.audienzz.mobile.util.addOnBecameVisibleOnScreenListener

class RCTRenderingRewardedView(context: Context) : RCTOriginalView(context) {
  private var auRewardedView: AudienzzRewardedAdUnit? = null

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
    val eventHandler = AudienzzGamRewardedEventHandler(currentActivity!!, adUnitID)

    auRewardedView = AudienzzRewardedAdUnit(currentActivity, auConfigID, eventHandler)

    if (pbAdSlot != null) {
      auRewardedView?.pbAdSlot = pbAdSlot
    }

    auRewardedView?.setRewardedAdUnitListener(object : AudienzzRewardedAdUnitListener {
      override fun onAdLoaded(rewardedAdUnit: AudienzzRewardedAdUnit?) {
        handleAdLoaded()
        rewardedAdUnit?.show()
      }

      override fun onAdDisplayed(rewardedAdUnit: AudienzzRewardedAdUnit?) {
        handleAdOpened()
      }

      override fun onAdFailed(rewardedAdUnit: AudienzzRewardedAdUnit?, exception: AudienzzAdException?) {
        handleAdFailedToLoad(exception)
      }

      override fun onAdClicked(rewardedAdUnit: AudienzzRewardedAdUnit?) {
        handleAdClicked()
      }

      override fun onAdClosed(rewardedAdUnit: AudienzzRewardedAdUnit?) {}

      override fun onUserEarnedReward(rewardedAdUnit: AudienzzRewardedAdUnit?, reward: AudienzzReward?) {
        handleAdClosed()
      }
    })

    this.addOnBecameVisibleOnScreenListener {
      auRewardedView?.loadAd()
    }
  }
}
