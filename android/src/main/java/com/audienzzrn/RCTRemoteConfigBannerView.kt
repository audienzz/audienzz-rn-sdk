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

  var requestContext = org.audienzz.mobile.targeting.AudienzzAdRequestContext()
    private set
  private var requestContextReserved = false

  fun reserveRequestContext() {
    if (requestContextReserved) return
    requestContext = org.audienzz.mobile.targeting.AudienzzAdRequestContext.forSlot(
      java.util.UUID.randomUUID().toString(), pageKey)
    requestContextReserved = true
  }

  private var configId: String? = null
  private var loadedConfigId: String? = null
  private var adWidth: Int? = null
  private var adHeight: Int? = null
  private var receivedSize: AdSize = AdSize(1, 1)
  private var remoteConfigBannerView: AudienzzRemoteBannerView? = null
  // Route key reported to pageImpression when this ad mounted. Every React Native ad lives in the
  // single host Activity, so the native page coordinator can't tell one route's ads from another's
  // by host identity — this key is what it matches on instead.
  private var pageKey: String? = null

  fun updatePageKey(value: String?) {
    pageKey = value
    value?.let { remoteConfigBannerView?.setScreen(it) }
  }

  override fun requestLayout() {
    super.requestLayout()
    post(measureAndLayout)
  }

  private val measureAndLayout = Runnable {
    val heightPx = (receivedSize.height * resources.displayMetrics.density).toInt()
    // Keep the RN-assigned (full) container width and only drive the dynamic ad
    // height. Forcing the container down to the creative's own width pinned it to
    // the left edge, so a creative narrower than the screen (e.g. 300x600 on a
    // tablet) rendered left-aligned instead of centered. The child banner is added
    // with Gravity.CENTER, so a full-width container centers it horizontally.
    val widthPx = if (width > 0) width else resources.displayMetrics.widthPixels

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

  /**
   * Force a fresh auction now, but only when the banner is actually on screen.
   * The pageImpression broadcast reaches every mounted banner, including those
   * on inactive (kept-mounted) screens; skip those so we don't burn an auction.
   */
  fun reloadIfVisible() {
    if (!isShown) return
    if (!getGlobalVisibleRect(android.graphics.Rect())) return
    remoteConfigBannerView?.reloadAd()
  }

  /**
   * Publisher pause, the command behind `bannerRef.current.stopAutoRefresh()`. Durable: only
   * [resumeAutoRefresh] clears it. It forwarded to the visibility pause, which any scroll undid.
   */
  fun stopAutoRefresh() {
    remoteConfigBannerView?.stopAutoRefresh()
  }

  /** Clears the publisher pause set by [stopAutoRefresh]. */
  fun resumeAutoRefresh() {
    remoteConfigBannerView?.resumeAutoRefresh()
  }

  /**
   * A cover the SDK cannot infer — a pointer-transparent veil, a painted overlay. Current state,
   * not an event, and separate from the publisher pause: clearing one must not clear the other.
   */
  fun setCovered(covered: Boolean) {
    // setHostCover, NOT onPause/onResume. Those write the same NOT_VISIBLE reason the native
    // geometry listener uses, and a RemoteBanner has that listener enabled — so a scroll back into
    // view cleared the cover, and clearing the cover cleared a genuine offscreen hold.
    remoteConfigBannerView?.setHostCover(covered)
  }

  fun loadAd() {
    val id = configId ?: return
    reserveRequestContext()

    // Lazy loading and the prefetch margin are not props: they come from the ad config alone,
    // which the native view reads when it builds the ad handler.
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
    // Detaching the predecessor is not enough: its handler stays registered with the page
    // coordinator and its refresh controller keeps posting, so a replaced banner went on
    // auctioning into a view nobody could see. Destroy it, and take out only our own child —
    // removeAllViews() would also drop anything React Native mounted inside this container.
    remoteConfigBannerView?.let { previous ->
      previous.destroy()
      removeView(previous)
    }
    remoteConfigBannerView = null

    val bannerView = AudienzzRemoteBannerView(context, id)

    addView(bannerView)
    bannerView.requestContext = requestContext
    remoteConfigBannerView = bannerView
    // Must precede the config-driven load inside AudienzzRemoteBannerView, which is where the ad
    // joins the current page. setScreen stores it as a pending key until the handler exists.
    pageKey?.let { bannerView.setScreen(it) }

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
