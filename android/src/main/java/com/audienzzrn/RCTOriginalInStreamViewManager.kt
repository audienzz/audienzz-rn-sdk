package com.audienzzrn

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class RCTOriginalInStreamViewManager : SimpleViewManager<RCTOriginalInStreamView>() {
  companion object {
    const val REACT_CLASS = "RCTOriginalInStreamView"
  }

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): RCTOriginalInStreamView {
    return RCTOriginalInStreamView(reactContext)
  }

  @ReactProp(name = "playbackMethod")
  fun setPlaybackMethod(view: RCTOriginalInStreamView, playbackMethods: ReadableArray) {
    val playbackMethodStrings = mutableListOf<String>()

    for (i in 0 until playbackMethods.size()) {
      val playbackMethodString = playbackMethods.getString(i)
      playbackMethodStrings.add(playbackMethodString)
    }

    view.findViewWithTag<RCTOriginalInStreamView>(RCTOriginalInStreamView.INSTREAM_VIEW_TAG)?.updatePlaybackMethod(playbackMethodStrings)
  }

  @ReactProp(name = "auConfigID")
  fun setAuConfigID(view: RCTOriginalInStreamView, auConfigID: String) {
    view.findViewWithTag<RCTOriginalInStreamView>(RCTOriginalInStreamView.INSTREAM_VIEW_TAG)
      ?.updateAuConfigID(auConfigID)
  }

  @ReactProp(name = "adUnitID")
  fun setAdUnitID(view: RCTOriginalInStreamView, adUnitID: String) {
    view.findViewWithTag<RCTOriginalInStreamView>(RCTOriginalInStreamView.INSTREAM_VIEW_TAG)
      ?.updateAdUnitID(adUnitID)
  }

  @ReactProp(name = "videoUrl")
  fun setVideoUrl(view: RCTOriginalInStreamView, videoUrl: String) {
    view.findViewWithTag<RCTOriginalInStreamView>(RCTOriginalInStreamView.INSTREAM_VIEW_TAG)
      ?.updateVideoUrl(videoUrl)
  }

  @ReactProp(name = "sizesForRequest")
  fun setSizesForRequest(view: RCTOriginalInStreamView, sizesForRequest: String) {
    view.findViewWithTag<RCTOriginalInStreamView>(RCTOriginalInStreamView.INSTREAM_VIEW_TAG)?.updateSizesForRequest(sizesForRequest)
  }

  @ReactProp(name = "apiParameters")
  fun setApiParameters(view: RCTOriginalInStreamView, apis: ReadableArray) {
    val apiStrings = mutableListOf<String>()

    for (i in 0 until apis.size()) {
      val apiString = apis.getString(i)
      apiStrings.add(apiString)
    }

    view.findViewWithTag<RCTOriginalInStreamView>(RCTOriginalInStreamView.INSTREAM_VIEW_TAG)?.updateApiParameters(apiStrings)
  }

  @ReactProp(name = "videoProtocols")
  fun setVideoProtocols(view: RCTOriginalInStreamView, videoProtocols: ReadableArray) {
    val videoProtocolsStrings = mutableListOf<String>()

    for (i in 0 until videoProtocols.size()) {
      val protocolString = videoProtocols.getString(i)
      videoProtocolsStrings.add(protocolString)
    }

    view.findViewWithTag<RCTOriginalInStreamView>(RCTOriginalInStreamView.INSTREAM_VIEW_TAG)?.updateVideoProtocols(videoProtocolsStrings)
  }

  @ReactProp(name = "videoDuration")
  fun setVideoDuration(view: RCTOriginalInStreamView, videoDuration: ReadableArray) {
    val videoDurationNumbers = mutableListOf<Int>()

    for (i in 0 until videoDuration.size()) {
      val durationNumber = videoDuration.getInt(i)
      videoDurationNumbers.add(durationNumber)
    }

    view.findViewWithTag<RCTOriginalInStreamView>(RCTOriginalInStreamView.INSTREAM_VIEW_TAG)?.updateVideoDuration(videoDurationNumbers)
  }

  @ReactProp(name = "videoBitrate")
  fun setVideoBitrate(view: RCTOriginalInStreamView, videoBitrate: ReadableArray) {
    val videoBitrateNumbers = mutableListOf<Int>()

    for (i in 0 until videoBitrate.size()) {
      val bitrateNumber = videoBitrate.getInt(i)
      videoBitrateNumbers.add(bitrateNumber)
    }

    view.findViewWithTag<RCTOriginalInStreamView>(RCTOriginalInStreamView.INSTREAM_VIEW_TAG)?.updateVideoBitrate(videoBitrateNumbers)
  }
}
