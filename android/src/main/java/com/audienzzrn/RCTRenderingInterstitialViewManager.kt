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

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class RCTRenderingInterstitialViewManager : SimpleViewManager<RCTRenderingInterstitialView>() {
  companion object {
    const val REACT_CLASS = "RCTRenderingInterstitialView"
  }

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): RCTRenderingInterstitialView {
    return RCTRenderingInterstitialView(reactContext)
  }

  override fun onAfterUpdateTransaction(view: RCTRenderingInterstitialView) {
    super.onAfterUpdateTransaction(view)

    if (view.getPropsChanged()) {
      Handler(Looper.getMainLooper()).postDelayed({
        view.createAd()
      }, 1100)

    }

    view.updatePropsChanged(false)
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
    fun eventMap(eventName: String) = mapOf("registrationName" to eventName)

    return mapOf(
      "onAdLoaded" to eventMap("onAdLoaded"),
      "onAdFailedToLoad" to eventMap("onAdFailedToLoad"),
      "onAdOpened" to eventMap("onAdOpened"),
      "onAdClosed" to eventMap("onAdClosed"),
      "onAdClicked" to eventMap("onAdClicked")
    )
  }

  @ReactProp(name = "auConfigID")
  fun setAuConfigID(view: RCTRenderingInterstitialView, value: String) {
    view.updateAuConfigID(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "adUnitID")
  fun setAdUnitID(view: RCTRenderingInterstitialView, value: String) {
    view.updateAdUnitID(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "adFormat")
  fun setAdFormat(view: RCTRenderingInterstitialView, value: String) {
    view.updateAdFormat(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "skipDelay")
  fun setSkipDelay(view: RCTRenderingInterstitialView, value: Int) {
    view.updateSkipDelay(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "minSizesPercentage")
  fun setMinSizesPercentage(view: RCTRenderingInterstitialView, value: ReadableArray) {
    val minSizesPercentageNumbers = mutableListOf<Int>()

    for (i in 0 until value.size()) {
      val bitrateNumber = value.getInt(i)
      minSizesPercentageNumbers.add(bitrateNumber)
    }

    view.updateMinSizesPercentage(minSizesPercentageNumbers)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "pbAdSlot")
  fun setPbAdSlot(view: RCTRenderingInterstitialView, value: String) {
    view.updatePbAdSlot(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "keyword")
  fun setKeyword(view: RCTRenderingInterstitialView, value: String) {
    view.updateKeyword(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "keywords")
  fun setKeywords(view: RCTRenderingInterstitialView, value: ReadableArray) {
    val keywordsSet = Utils.readableArrayToSet(value)
    view.updateKeywords(keywordsSet)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "appContent")
  fun setAppContent(view: RCTRenderingInterstitialView, value: ReadableMap) {
    val appContent = Utils.createContentObject(value)
    view.updateAppContent(appContent)
    view.updatePropsChanged(true)
  }
}

