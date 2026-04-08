package com.audienzz

import android.content.Context
import android.util.Log
import android.view.Gravity
import android.widget.FrameLayout
import androidx.core.view.doOnNextLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.LoadAdError
import org.audienzz.mobile.AudienzzRemoteBannerView

class RCTRemoteConfigBannerView(context: Context) : FrameLayout(context) {

  private var configId: String? = null
  private var loadedConfigId: String? = null
  private var remoteConfigBannerView: AudienzzRemoteBannerView? = null

  fun updateConfigId(value: String) {
    configId = value
  }

  fun getConfigId(): String? = configId

  fun loadAd() {
    val id = configId ?: return

    if (id == loadedConfigId && remoteConfigBannerView != null) {
      Log.d(TAG, "Ad already loaded for config: $id, skipping")
      return
    }

    loadedConfigId = id
    Log.d(TAG, "Loading ad for config: $id, container size: ${width}x${height}")

    loadAdInternal(id)
  }

  fun refresh() {
    loadedConfigId = null
    loadAd()
  }

  private fun loadAdInternal(id: String) {

    removeAllViews()

    val bannerView = AudienzzRemoteBannerView(context, id)

    addView(bannerView)
    remoteConfigBannerView = bannerView

    bannerView.setAdListener(object : AdListener() {
      override fun onAdLoaded() {
        val size = bannerView.getAdSize()
        Log.d(TAG, "Ad loaded successfully, size: ${size?.width}x${size?.height}")
        handleAdLoaded(size)
      }

      override fun onAdFailedToLoad(error: LoadAdError) {
        Log.e(TAG, "Ad failed to load: ${error.message}")
        handleAdFailed(error.message)
      }

      override fun onAdClicked() {
        handleAdClicked()
      }

      override fun onAdOpened() {
        handleAdOpened()
      }

      override fun onAdClosed() {
        handleAdClosed()
      }
    })

    val loadBannerWithSize = {
      val containerWidth = width
      val containerHeight = height
      Log.d(TAG, "loadBannerWithSize called, container: ${containerWidth}x${containerHeight}")

      if (containerWidth > 0 && containerHeight > 0) {
        Log.d(TAG, "Setting explicit size: ${containerWidth}x${containerHeight}")
        bannerView.layoutParams = LayoutParams(containerWidth, containerHeight, Gravity.CENTER)
        bannerView.loadAd()
      } else {
        Log.d(TAG, "Using MATCH_PARENT/WRAP_CONTENT (adaptive)")
        bannerView.layoutParams = LayoutParams(
          LayoutParams.MATCH_PARENT,
          LayoutParams.WRAP_CONTENT,
          Gravity.CENTER
        )
        bannerView.loadAd()
      }
    }

    if (width > 0 && height > 0) {
      Log.d(TAG, "Container has dimensions, loading immediately")
      loadBannerWithSize()
    } else {
      Log.d(TAG, "Waiting for container layout")
      doOnNextLayout {
        Log.d(TAG, "doOnNextLayout triggered")
        loadBannerWithSize()
      }
    }
  }

  fun destroy() {
    remoteConfigBannerView?.destroy()
    remoteConfigBannerView = null
    loadedConfigId = null
    removeAllViews()
  }

  private fun handleAdLoaded(adSize: AdSize?) {
    val size: WritableMap = Arguments.createMap()
    if (adSize != null) {
        size.putInt("width", adSize.width)
        size.putInt("height", adSize.height)
    } else {
        size.putInt("width", 0)
        size.putInt("height", 0)
    }

    (context as ReactContext)
      .getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdLoaded", size)
  }

  private fun handleAdFailed(message: String) {
    val error: WritableMap = Arguments.createMap()
    error.putString("message", message)

    (context as ReactContext)
      .getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdFailedToLoad", error)
  }

  private fun handleAdClicked() {
    (context as ReactContext)
      .getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdClicked", null)
  }

  private fun handleAdOpened() {
      (context as ReactContext)
          .getJSModule(RCTEventEmitter::class.java)
          .receiveEvent(id, "onAdOpened", null)
  }

  private fun handleAdClosed() {
    (context as ReactContext)
      .getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAdClosed", null)
  }

  companion object {
    private const val TAG = "RCTRemoteConfigBanner"
  }
}


