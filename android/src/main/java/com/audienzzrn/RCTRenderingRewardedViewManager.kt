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

class RCTRenderingRewardedViewManager : SimpleViewManager<RCTRenderingRewardedView>() {

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): RCTRenderingRewardedView {
    return RCTRenderingRewardedView(reactContext)
  }

  override fun onAfterUpdateTransaction(view: RCTRenderingRewardedView) {
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
      "onAdClicked" to eventMap("onAdClicked"),
    )
  }

  @ReactProp(name = "auConfigID")
  fun setAuConfigID(view: RCTRenderingRewardedView, value: String) {
    view.updateAuConfigID(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "adUnitID")
  fun setAdUnitID(view: RCTRenderingRewardedView, value: String) {
    view.updateAdUnitID(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "pbAdSlot")
  fun setPbAdSlot(view: RCTRenderingRewardedView, value: String) {
    view.updatePbAdSlot(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "keyword")
  fun setKeyword(view: RCTRenderingRewardedView, value: String) {
    view.updateKeyword(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "keywords")
  fun setKeywords(view: RCTRenderingRewardedView, value: ReadableArray) {
    val keywordsSet = Utils.readableArrayToSet(value)
    view.updateKeywords(keywordsSet)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "appContent")
  fun setAppContent(view: RCTRenderingRewardedView, value: ReadableMap) {
    val appContent = Utils.createContentObject(value)
    view.updateAppContent(appContent)
    view.updatePropsChanged(true)
  }

  companion object {
    const val REACT_CLASS = "RCTRenderingRewardedView"
  }
}
