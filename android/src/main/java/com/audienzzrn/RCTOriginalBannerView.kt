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
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.LoadAdError
import org.audienzz.mobile.AudienzzAdSize
import org.audienzz.mobile.AudienzzBannerAdUnit

class RCTOriginalBannerView(context: Context) : RCTOriginalView(context) {
  private var sizes: Array<AudienzzAdSize> = arrayOf()
  private var receivedSize: AdSize = AdSize(1,1)
  private var autoRefreshPeriodMillis: Int? = null
  private var videoPlacement: String = ""

  private var auBannerView: AudienzzBannerAdUnit? = null

  override fun requestLayout() {
    super.requestLayout()
    post(measureAndLayout)
  }

  private val measureAndLayout = Runnable {
    val heightPx = (receivedSize.height  * resources.displayMetrics.density).toInt()
    val widthPx = (receivedSize.width * resources.displayMetrics.density).toInt()

    val heightMeasureSpec = MeasureSpec.makeMeasureSpec(heightPx, MeasureSpec.EXACTLY)
    measure(MeasureSpec.makeMeasureSpec(widthPx, MeasureSpec.EXACTLY), heightMeasureSpec)
    layout(left, top, right, top + heightPx)
  }

  fun handleAdLoaded(adSize: AdSize) {
    val size: WritableMap = Arguments.createMap()
    size.putInt("width", adSize.width)
    size.putInt("height", adSize.height)
    (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdLoaded", size)
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

  fun handleAdFailedToLoad(loadError: LoadAdError) {
    val error: WritableMap = Arguments.createMap()
    error.putInt("code", loadError.code)
    error.putString("message", loadError.message)
    (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdFailedToLoad", error)
    auBannerView?.stopAutoRefresh()
  }

  fun stopAutoRefresh() {
    auBannerView?.stopAutoRefresh()
  }

  fun resumeAutoRefresh() {
    auBannerView?.resumeAutoRefresh()
  }

  fun updateAuBannerView(value: AudienzzBannerAdUnit) {
    auBannerView = value
  }

  fun updateAutoRefreshPeriodMillis(value: Int) {
    autoRefreshPeriodMillis = value
  }

  fun getAutoRefreshPeriodMillis(): Int? {
    return autoRefreshPeriodMillis
  }

  fun updateVideoPlacement(value: String) {
    videoPlacement = value
  }

  fun getVideoPlacement(): String {
    return videoPlacement
  }

  fun updateSizes(value: Array<AudienzzAdSize>) {
    sizes = value
  }

  fun getSizes(): Array<AudienzzAdSize>{
    return sizes
  }

  fun setSize(adSize: AdSize){
    receivedSize = adSize
    requestLayout()
  }
}
