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
import android.view.View
import android.view.ViewGroup
import androidx.core.view.doOnNextLayout
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.admanager.AdManagerAdView
import org.audienzz.mobile.AudienzzBannerAdUnit
import org.audienzz.mobile.AudienzzBannerParameters
import org.audienzz.mobile.AudienzzContentObject
import org.audienzz.mobile.AudienzzSignals
import org.audienzz.mobile.AudienzzVideoParameters
import org.audienzz.mobile.original.AudienzzAdViewHandler

class RCTOriginalBannerViewManager : SimpleViewManager<RCTOriginalBannerView>() {
  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): RCTOriginalBannerView {
    return RCTOriginalBannerView(reactContext)
  }

  override fun onAfterUpdateTransaction(reactViewGroup: RCTOriginalBannerView) {
    super.onAfterUpdateTransaction(reactViewGroup)

    if (reactViewGroup.getPropsChanged()) {
      Handler(Looper.getMainLooper()).postDelayed({ requestAd(reactViewGroup) }, 1100)
    }

    reactViewGroup.updatePropsChanged(false)
  }

  override fun onDropViewInstance(reactViewGroup: RCTOriginalBannerView) {
    super.onDropViewInstance(reactViewGroup)

    val adView = getAdView(reactViewGroup)

    if (adView != null) {
      adView.adListener = EMPTY_AD_LISTENER
    }
    if (adView is AdManagerAdView) {
      adView.appEventListener = null
    }

    adView?.destroy()
    reactViewGroup.removeView(adView)
  }

  override fun receiveCommand(view: RCTOriginalBannerView, commandId: Int, args: ReadableArray?) {
    when (commandId) {
      0 -> view.stopAutoRefresh()
      1 -> view.resumeAutoRefresh()
    }
  }

  override fun getCommandsMap(): Map<String, Int> {
    return mapOf(STOP_AUTO_REFRESH to 0, RESUME_AUTO_REFRESH to 1)
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
    fun eventMap(eventName: String) = mapOf("registrationName" to eventName)

    return mapOf(
      "onAdLoaded" to eventMap("onAdLoaded"),
      "onAdClicked" to eventMap("onAdClicked"),
      "onAdOpened" to eventMap("onAdOpened"),
      "onAdClosed" to eventMap("onAdClosed"),
      "onAdFailedToLoad" to eventMap("onAdFailedToLoad")
    )
  }

  private fun findRCTOriginalBannerView(view: View): AdManagerAdView? {
    if (view is ViewGroup) {
      for (i in 0 until view.childCount) {
        val child = view.getChildAt(i)
        val bannerView = findRCTOriginalBannerView(child)

        if (bannerView != null) {
          return bannerView
        }
      }
    }

    return null
  }

  private fun getAdView(reactViewGroup: ViewGroup): AdManagerAdView? {
    return findRCTOriginalBannerView(reactViewGroup)
  }

  private fun initAdView(reactViewGroup: RCTOriginalBannerView): AdManagerAdView? {
    val oldAdView = getAdView(reactViewGroup)

    if (oldAdView != null) {
      oldAdView.adListener = EMPTY_AD_LISTENER
    }

    if (oldAdView is AdManagerAdView) {
      oldAdView.appEventListener = null
    }

    oldAdView?.destroy()
    reactViewGroup.removeView(oldAdView)

    val currentActivity = (reactViewGroup.context as ReactContext).currentActivity ?: return null
    val adView = AdManagerAdView(currentActivity)
    reactViewGroup.addView(adView)

    adView.adListener =
      object : AdListener() {
        override fun onAdLoaded() {
          reactViewGroup.handleAdLoaded()
        }

        override fun onAdClicked() {
          reactViewGroup.handleAdClicked()
        }

        override fun onAdOpened() {
          reactViewGroup.handleAdOpened()
        }

        override fun onAdClosed() {
          reactViewGroup.handleAdClosed()
        }

        override fun onAdFailedToLoad(loadAdError: LoadAdError) {
          reactViewGroup.handleAdFailedToLoad(loadAdError)
        }
      }

    return adView
  }

  private fun requestAd(reactViewGroup: RCTOriginalBannerView) {
    val adView = initAdView(reactViewGroup)
    val isLazyLoad = reactViewGroup.isLazyLoad
    val isAdaptive = reactViewGroup.isAdaptive
    val adUnitID: String = reactViewGroup.adUnitID
    val auConfigID: String = reactViewGroup.auConfigID
    val width: Int = reactViewGroup.getWIDTH()
    val height: Int = reactViewGroup.getHEIGHT()
    val adFormats: List<String> = reactViewGroup.adFormats
    val apiParameters: List<String> = reactViewGroup.apiParameters
    val videoProtocols: List<String> = reactViewGroup.videoProtocols
    val playbackMethods: List<String> = reactViewGroup.playbackMethods
    val videoBitrate: List<Int> = reactViewGroup.videoBitrate!!
    val videoDuration: List<Int> = reactViewGroup.videoDuration!!
    val videoPlacement: String = reactViewGroup.getVideoPlacement()
    val autoRefreshPeriodMillis: Int? = reactViewGroup.getAutoRefreshPeriodMillis()?.div(1000)
    val pbAdSlot: String? = reactViewGroup.pbAdSlot
    val gpID: String? = reactViewGroup.gpID
    val keywords: Set<String>? = reactViewGroup.keywords
    val keyword: String? = reactViewGroup.keyword
    val appContent: AudienzzContentObject? = reactViewGroup.appContent
    val auBannerView =
      AudienzzBannerAdUnit(
        auConfigID,
        width,
        height,
        AudienzzConversionUtils.convertToAudienzzAdFormats(adFormats)
      )

    reactViewGroup.updateAuBannerView(auBannerView)

    val bannerParameters = AudienzzBannerParameters()
    val videoParameters = AudienzzVideoParameters(listOf("video/x-flv", "video/mp4"))

    val allowedApis = mutableListOf<AudienzzSignals.Api>()
    val allowedPlaybackMethods = mutableListOf<AudienzzSignals.PlaybackMethod>()
    val allowedProtocols = mutableListOf<AudienzzSignals.Protocols>()

    for (apiString in apiParameters) {
      val api = AudienzzConversionUtils.convertToAudienzzApi(apiString)

      if (api != null) {
        allowedApis.add(api)
      }
    }

    for (protocolString in videoProtocols) {
      val protocol = AudienzzConversionUtils.convertToAudienzzVideoProtocols(protocolString)

      if (protocol != null) {
        allowedProtocols.add(protocol)
      }
    }

    for (playbackMethodString in playbackMethods) {
      val playbackMethod =
        AudienzzConversionUtils.convertToAudienzzPlaybackMethod(playbackMethodString)

      if (playbackMethod != null) {
        allowedPlaybackMethods.add(playbackMethod)
      }
    }

    bannerParameters.api = allowedApis

    videoParameters.api = allowedApis
    videoParameters.protocols = allowedProtocols
    videoParameters.playbackMethod = allowedPlaybackMethods
    videoParameters.placement =
      AudienzzConversionUtils.convertToAudienzzVideoPlacement(videoPlacement)
    videoParameters.minBitrate = videoBitrate[0]
    videoParameters.maxBitrate = videoBitrate[1]
    videoParameters.minDuration = videoDuration[0]
    videoParameters.maxDuration = videoDuration[1]

    if (autoRefreshPeriodMillis != null) {
      auBannerView.setAutoRefreshInterval(autoRefreshPeriodMillis)
    }
    if (pbAdSlot != null) {
      auBannerView.pbAdSlot = pbAdSlot
    }
    if (gpID != null) {
      auBannerView.gpid = gpID
    }
    if (keyword != null) {
      auBannerView.addExtKeyword(keyword)
    }
    if (keywords != null) {
      auBannerView.addExtKeywords(keywords)
    }
    if (appContent != null) {
      auBannerView.appContent = appContent
    }

    auBannerView.bannerParameters = bannerParameters
    auBannerView.videoParameters = videoParameters

    if (adView != null) {
      adView.apply {
        setAdSize(AdSize(width, height))
        adUnitId = adUnitID
      }

      if (isAdaptive) {
        adView.doOnNextLayout {
          adView.setAdSizes(
            AdSize.getInlineAdaptiveBannerAdSize(width, height)
          )
        }
      }

      AudienzzAdViewHandler(
        adView = adView,
        adUnit = auBannerView,
      )
        .load(callback = { request, _ -> adView.loadAd(request) }, withLazyLoading = isLazyLoad)
    }
  }

  @ReactProp(name = "playbackMethod")
  fun setPlaybackMethod(view: RCTOriginalBannerView, value: ReadableArray) {
    val playbackMethodStrings = mutableListOf<String>()

    for (i in 0 until value.size()) {
      val playbackMethodString = value.getString(i)
      if (playbackMethodString != null) {
        playbackMethodStrings.add(playbackMethodString)
      }
    }

    view.updatePlaybackMethod(playbackMethodStrings)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "isLazyLoad")
  fun setIsLazyLoad(view: RCTOriginalBannerView, value: Boolean) {
    view.updateIsLazyLoad(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "isAdaptive")
  fun setIsAdaptive(view: RCTOriginalBannerView, value: Boolean) {
    view.updateIsAdaptive(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "adFormats")
  fun setAdFormats(view: RCTOriginalBannerView, value: ReadableArray) {
    val adFormatStrings = mutableListOf<String>()

    for (i in 0 until value.size()) {
      val apiString = value.getString(i)
      if (apiString != null) {
        adFormatStrings.add(apiString)
      }
    }

    view.updateAdFormats(adFormatStrings)
  }

  @ReactProp(name = "apiParameters")
  fun setApiParameters(view: RCTOriginalBannerView, value: ReadableArray) {
    val apiStrings = mutableListOf<String>()

    for (i in 0 until value.size()) {
      val apiString = value.getString(i)
      if (apiString != null) {
        apiStrings.add(apiString)
      }
    }

    view.updateApiParameters(apiStrings)
  }

  @ReactProp(name = "videoProtocols")
  fun setVideoProtocols(view: RCTOriginalBannerView, value: ReadableArray) {
    val videoProtocolsStrings = mutableListOf<String>()

    for (i in 0 until value.size()) {
      val protocolString = value.getString(i)
      if (protocolString != null) {
        videoProtocolsStrings.add(protocolString)
      }
    }

    view.updateVideoProtocols(videoProtocolsStrings)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "videoDuration")
  fun setVideoDuration(view: RCTOriginalBannerView, value: ReadableArray) {
    val videoDurationNumbers = mutableListOf<Int>()

    for (i in 0 until value.size()) {
      val durationNumber = value.getInt(i)
      videoDurationNumbers.add(durationNumber)
    }

    view.updateVideoDuration(videoDurationNumbers)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "videoBitrate")
  fun setVideoBitrate(view: RCTOriginalBannerView, value: ReadableArray) {
    val videoBitrateNumbers = mutableListOf<Int>()

    for (i in 0 until value.size()) {
      val bitrateNumber = value.getInt(i)
      videoBitrateNumbers.add(bitrateNumber)
    }

    view.updateVideoBitrate(videoBitrateNumbers)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "videoPlacement")
  fun setVideoPlacement(view: RCTOriginalBannerView, value: String) {
    view.updateVideoPlacement(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "adUnitID")
  fun setAdUnitID(view: RCTOriginalBannerView, value: String) {
    view.updateAdUnitID(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "auConfigID")
  fun setAuConfigID(view: RCTOriginalBannerView, value: String) {
    view.updateAuConfigID(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "width")
  fun setWidth(view: RCTOriginalBannerView, value: Int) {
    view.updateWidth(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "height")
  fun setHeight(view: RCTOriginalBannerView, value: Int) {
    view.updateHeight(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "autoRefreshPeriodMillis")
  fun setAutoRefreshPeriodMillis(view: RCTOriginalBannerView, value: Int) {
    view.updateAutoRefreshPeriodMillis(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "pbAdSlot")
  fun setPbAdSlot(view: RCTOriginalBannerView, value: String) {
    view.updatePbAdSlot(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "gpID")
  fun setGpID(view: RCTOriginalBannerView, value: String) {
    view.updateGpID(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "keyword")
  fun setKeyword(view: RCTOriginalBannerView, value: String) {
    view.updateKeyword(value)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "keywords")
  fun setKeywords(view: RCTOriginalBannerView, value: ReadableArray) {
    val keywordsSet = Utils.readableArrayToSet(value)
    view.updateKeywords(keywordsSet)
    view.updatePropsChanged(true)
  }

  @ReactProp(name = "appContent")
  fun setAppContent(view: RCTOriginalBannerView, value: ReadableMap) {
    val appContent = Utils.createContentObject(value)
    view.updateAppContent(appContent)
    view.updatePropsChanged(true)
  }

  companion object {
    private val EMPTY_AD_LISTENER = object : AdListener() {}
    const val REACT_CLASS = "RCTOriginalBannerView"
    const val STOP_AUTO_REFRESH = "stopAutoRefresh"
    const val RESUME_AUTO_REFRESH = "resumeAutoRefresh"
  }
}
