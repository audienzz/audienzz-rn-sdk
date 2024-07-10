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

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class RCTOriginalInterstitialViewManager : SimpleViewManager<RCTOriginalInterstitialView>() {
  companion object {
    const val REACT_CLASS = "RCTOriginalInterstitialView"
  }

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): RCTOriginalInterstitialView {
    return RCTOriginalInterstitialView(reactContext)
  }

  override fun onAfterUpdateTransaction(view: RCTOriginalInterstitialView) {
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
      "onAdClicked" to eventMap("onAdClicked"),
      "onAdOpened" to eventMap("onAdOpened"),
      "onAdClosed" to eventMap("onAdClosed"),
    )
  }

  @ReactProp(name = "playbackMethod")
  fun setPlaybackMethod(view: RCTOriginalInterstitialView, value: ReadableArray) {
    val playbackMethodStrings = mutableListOf<String>()

    for (i in 0 until value.size()) {
      val playbackMethodString = value.getString(i)
      playbackMethodStrings.add(playbackMethodString)
    }

    view.updatePlaybackMethod(playbackMethodStrings)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "auConfigID")
  fun setAuConfigID(view: RCTOriginalInterstitialView, value: String) {
    view.updateAuConfigID(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "adUnitID")
  fun setAdUnitID(view: RCTOriginalInterstitialView, value: String) {
    view.updateAdUnitID(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "adFormats")
  fun setAdFormats(view: RCTOriginalInterstitialView, value: ReadableArray) {
    val adFormatStrings = mutableListOf<String>()

    for (i in 0 until value.size()) {
      val apiString = value.getString(i)
      adFormatStrings.add(apiString)
    }

    view.updateAdFormats(adFormatStrings)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "apiParameters")
  fun setApiParameters(view: RCTOriginalInterstitialView, value: ReadableArray) {
    val apiStrings = mutableListOf<String>()

    for (i in 0 until value.size()) {
      val apiString = value.getString(i)
      apiStrings.add(apiString)
    }

    view.updateApiParameters(apiStrings)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "videoProtocols")
  fun setVideoProtocols(view: RCTOriginalInterstitialView, value: ReadableArray) {
    val videoProtocolsStrings = mutableListOf<String>()

    for (i in 0 until value.size()) {
      val protocolString = value.getString(i)
      videoProtocolsStrings.add(protocolString)
    }

    view.updateVideoProtocols(videoProtocolsStrings)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "videoDuration")
  fun setVideoDuration(view: RCTOriginalInterstitialView, value: ReadableArray) {
    val videoDurationNumbers = mutableListOf<Int>()

    for (i in 0 until value.size()) {
      val durationNumber = value.getInt(i)
      videoDurationNumbers.add(durationNumber)
    }

    view.updateVideoDuration(videoDurationNumbers)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "videoBitrate")
  fun setVideoBitrate(view: RCTOriginalInterstitialView, value: ReadableArray) {
    val videoBitrateNumbers = mutableListOf<Int>()

    for (i in 0 until value.size()) {
      val bitrateNumber = value.getInt(i)
      videoBitrateNumbers.add(bitrateNumber)
    }

    view.updateVideoBitrate(videoBitrateNumbers)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "minSizesPercentage")
  fun setMinSizesPercentage(view: RCTOriginalInterstitialView, value: ReadableArray) {
    val minSizesPercentageNumbers = mutableListOf<Int>()

    for (i in 0 until value.size()) {
      val bitrateNumber = value.getInt(i)
      minSizesPercentageNumbers.add(bitrateNumber)
    }

    view.updateMinSizesPercentage(minSizesPercentageNumbers)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "pbAdSlot")
  fun setPbAdSlot(view: RCTOriginalInterstitialView, value: String) {
    view.updatePbAdSlot(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "gpID")
  fun setGpID(view: RCTOriginalInterstitialView, value: String) {
    view.updateGpID(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "keyword")
  fun setKeyword(view: RCTOriginalInterstitialView, value: String) {
    view.updateKeyword(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "keywords")
  fun setKeywords(view: RCTOriginalInterstitialView, value: ReadableArray) {
    val keywordsSet = Utils.readableArrayToSet(value)
    view.updateKeywords(keywordsSet)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "appContent")
  fun setAppContent(view: RCTOriginalInterstitialView, value: ReadableMap) {
    val appContent = Utils.createContentObject(value)
    view.updateAppContent(appContent)
    view.updatePropsChanged(true)
  }
}
