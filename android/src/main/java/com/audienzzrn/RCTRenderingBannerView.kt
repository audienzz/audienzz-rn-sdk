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
import org.audienzz.mobile.api.rendering.AudienzzBannerView
import org.audienzz.mobile.api.rendering.listeners.AudienzzBannerViewListener
import org.audienzz.mobile.eventhandlers.AudienzzGamBannerEventHandler

class RCTRenderingBannerView(context: Context) : RCTOriginalView(context) {
  private var adWidth: Int = 0
  private var adHeight: Int = 0
  private var videoPlacement: String = ""

  private var auBannerView: AudienzzBannerView? = null

  override fun requestLayout() {
    super.requestLayout()
    post(measureAndLayout)
  }

  private val measureAndLayout = Runnable {
    val heightMeasureSpec = MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
    measure(MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY), heightMeasureSpec)
    layout(left, top, right, top + height)
  }

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
    auBannerView?.stopRefresh()
  }

  override fun createAd() {
    super.createAd()

    val currentActivity = (context as ReactContext).currentActivity
    val eventHandler =
      AudienzzGamBannerEventHandler(currentActivity!!, adUnitID, AudienzzAdSize(adWidth, adHeight))

    auBannerView = AudienzzBannerView(currentActivity, auConfigID, eventHandler)
    updateAuBannerView(auBannerView!!)

    if (pbAdSlot != null) {
      auBannerView?.pbAdSlot = pbAdSlot
    }
    if (keyword != null) {
      auBannerView?.addExtKeyword(keyword!!)
    }
    if (keywords != null) {
      auBannerView?.addExtKeywords(keywords!!)
    }
    if (appContent != null) {
      auBannerView?.setAppContent(appContent!!)
    }

    auBannerView?.videoPlacementType =  AudienzzConversionUtils.convertToAudienzzVideoPlacementType(videoPlacement)

    addView(auBannerView?.view)

    auBannerView?.setBannerListener(object :
      AudienzzBannerViewListener {
      override fun onAdLoaded(bannerView: AudienzzBannerView?) {
        handleAdLoaded()
      }
      override fun onAdDisplayed(bannerView: AudienzzBannerView?) {
        handleAdOpened()
      }
      override fun onAdFailed(bannerView: AudienzzBannerView?, exception: AudienzzAdException?) {
        handleAdFailedToLoad(exception)
      }
      override fun onAdClicked(bannerView: AudienzzBannerView?) {
        handleAdClicked()
      }
      override fun onAdClosed(bannerView: AudienzzBannerView?) {
        handleAdClosed()
      }
    })

    auBannerView?.loadAd(lazyLoad = isLazyLoad)
  }

  private fun updateAuBannerView(value: AudienzzBannerView) {
    auBannerView = value
  }

  fun updateVideoPlacement(value: String) {
    videoPlacement = value
  }

  fun updateWidth(value: Int) {
    adWidth = value
  }

  fun updateHeight(value: Int) {
    adHeight = value
  }
}

