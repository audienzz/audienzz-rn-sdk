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
import android.widget.FrameLayout
import org.audienzz.mobile.AudienzzBannerParameters
import org.audienzz.mobile.AudienzzSignals
import org.audienzz.mobile.AudienzzVideoParameters

open class RCTOriginalView(context: Context) : FrameLayout(context) {
  var adFormats: List<String> = listOf()
  var adUnitID: String = ""
  var auConfigID: String = ""
  var videoBitrate: List<Int>? = null
  var videoDuration: List<Int>? = null
  var pbAdSlot: String? = null
  var gpID: String? = null
  var keyword: String? = null
  var playbackMethods: List<String> = listOf()
  var apiParameters: List<String> = listOf()
  var videoProtocols: List<String> = listOf()
  var isLazyLoad: Boolean = true
  var isAdaptive: Boolean = false
  var impOrtbConfig: String? = null
  private var propsChanged: Boolean = false

  var bannerParameters = AudienzzBannerParameters()
  var videoParameters = AudienzzVideoParameters(listOf("video/x-flv", "video/mp4"))

  open fun createAd() {
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
    videoParameters.placement = AudienzzSignals.Placement.Interstitial
    if (videoDuration != null) {
      videoParameters.minDuration = videoDuration!![0]
      videoParameters.maxDuration = videoDuration!![1]
    }
    if (videoBitrate != null) {
      videoParameters.minBitrate = videoBitrate!![0]
      videoParameters.maxBitrate = videoBitrate!![1]
    }

  }

  fun updatePbAdSlot(value: String) {
    pbAdSlot = value
  }

  fun updateGpID(value: String) {
    gpID = value
  }

  fun updateAdFormats(value: List<String>) {
    adFormats = value
  }

  fun updateApiParameters(value: List<String>) {
    apiParameters = value
  }

  fun updateVideoProtocols(value: List<String>) {
    videoProtocols = value
  }

  fun updatePlaybackMethod(value: List<String>) {
    playbackMethods = value
  }

  fun updateVideoBitrate(value: List<Int>) {
    videoBitrate = value
  }

  fun updateVideoDuration(value: List<Int>) {
    videoDuration = value
  }

  fun updateAuConfigID(value: String) {
    auConfigID = value
  }

  fun updateAdUnitID(value: String) {
    adUnitID = value
  }

  fun updateImpOrtbConfig(value: String){
    impOrtbConfig = value
  }

  fun updateIsLazyLoad(value: Boolean) {
    isLazyLoad = value
  }

  fun updateIsAdaptive(value: Boolean) {
    isAdaptive = value
  }

  fun updatePropsChanged(value: Boolean) {
    propsChanged = value
  }

  fun getPropsChanged(): Boolean {
    return propsChanged
  }
}
