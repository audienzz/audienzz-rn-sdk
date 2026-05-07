package com.audienzz

import android.content.Context
import android.util.Log
import android.view.Gravity
import android.widget.FrameLayout
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
  private var adWidth: Int? = null
  private var adHeight: Int? = null
  private var receivedSize: AdSize = AdSize(1, 1)
  private var remoteConfigBannerView: AudienzzRemoteBannerView? = null

  override fun requestLayout() {
    super.requestLayout()
    post(measureAndLayout)
  }

  private val measureAndLayout = Runnable {
    val heightPx = (receivedSize.height * resources.displayMetrics.density).toInt()
    val widthPx = (receivedSize.width * resources.displayMetrics.density).toInt()

    if (widthPx <= 0 || heightPx <= 0) {
      return@Runnable
    }

    val heightMeasureSpec = MeasureSpec.makeMeasureSpec(heightPx, MeasureSpec.EXACTLY)
    measure(MeasureSpec.makeMeasureSpec(widthPx, MeasureSpec.EXACTLY), heightMeasureSpec)
    layout(left, top, left + widthPx, top + heightPx)
  }

  fun updateConfigId(value: String) {
    configId = value
  }

  fun updateAdWidth(value: Int) {
    adWidth = value.takeIf { it > 0 }
  }

  fun updateAdHeight(value: Int) {
    adHeight = value.takeIf { it > 0 }
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

    if (adWidth != null && adHeight != null) {
      // Fixed size: use explicit dp dimensions converted to pixels
      val widthPx = (adWidth!! * resources.displayMetrics.density).toInt()
      val heightPx = (adHeight!! * resources.displayMetrics.density).toInt()
      Log.d(TAG, "Fixed size: ${adWidth}dp x ${adHeight}dp → ${widthPx}px x ${heightPx}px")
      bannerView.layoutParams = LayoutParams(widthPx, heightPx, Gravity.CENTER)
      bannerView.loadAd()
    } else {
      // Adaptive: AudienzzRemoteBannerView.createAdFromConfig reads `this.width` to compute
      // the adaptive AdSize. In the RN bridge the view hierarchy has 0×0 dimensions until
      // onAdLoaded fires, so `this.width` would be 0 → AdSize width 0 → GAM HTTP 400.
      // Pre-measure with the real screen width so the value is available synchronously,
      // before the config-fetch coroutine resumes on the Main dispatcher.
      val screenWidthPx = resources.displayMetrics.widthPixels
      Log.d(TAG, "Adaptive mode, pre-measuring with screen width: ${screenWidthPx}px")
      bannerView.layoutParams = LayoutParams(screenWidthPx, LayoutParams.WRAP_CONTENT, Gravity.CENTER)
      bannerView.measure(
        MeasureSpec.makeMeasureSpec(screenWidthPx, MeasureSpec.EXACTLY),
        MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED)
      )
      bannerView.layout(0, 0, bannerView.measuredWidth, bannerView.measuredHeight)
      bannerView.loadAd()
    }
  }

  fun destroy() {
    remoteConfigBannerView?.destroy()
    remoteConfigBannerView = null
    loadedConfigId = null
    removeAllViews()
  }

  private fun handleAdLoaded(adSize: AdSize?) {
    if (adSize != null) {
      receivedSize = adSize
      requestLayout()
    }

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
