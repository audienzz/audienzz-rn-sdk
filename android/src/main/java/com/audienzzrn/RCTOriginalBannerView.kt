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
import org.audienzz.mobile.original.AudienzzAdViewHandler

class RCTOriginalBannerView(context: Context) : RCTOriginalView(context) {
  var requestContext = org.audienzz.mobile.targeting.AudienzzAdRequestContext()
    private set
  private var requestContextReserved = false

  fun reserveRequestContext() {
    if (requestContextReserved) return
    requestContext = org.audienzz.mobile.targeting.AudienzzAdRequestContext.forSlot(
      java.util.UUID.randomUUID().toString(), pageKey)
    requestContextReserved = true
  }

  private var sizes: Array<AudienzzAdSize> = arrayOf()
  private var receivedSize: AdSize = AdSize(1,1)
  private var autoRefreshPeriodMillis: Int? = null
  private var videoPlacement: String = ""
  private var smartRefresh: Boolean = false
  private var prefetchMarginDp: Int = 200
  // Route key reported to pageImpression when this ad mounted. Every React Native ad lives in the
  // single host Activity, so the native page coordinator can't tell one route's ads from another's
  // by host identity — this key is what it matches on instead.
  private var pageKey: String? = null

  private var auBannerView: AudienzzBannerAdUnit? = null
  private var adViewHandler: AudienzzAdViewHandler? = null

  override fun requestLayout() {
    super.requestLayout()
    post(measureAndLayout)
  }

  private val measureAndLayout = Runnable {
    val heightPx = (receivedSize.height  * resources.displayMetrics.density).toInt()
    // Keep the RN-assigned (full) width. Measuring the host to the creative's own width
    // (and adding the child without centering) left-aligned a sub-width creative on a
    // host wider than the creative. The child is added with Gravity.CENTER_HORIZONTAL
    // (see RCTOriginalBannerViewManager), so a full-width host centers it.
    val widthPx = if (width > 0) width else resources.displayMetrics.widthPixels

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
    // Deliberately no refresh stop here. This is a GAM load failure, not a publisher decision, and
    // stopping on it would be indistinguishable from stopAutoRefresh() — nothing but an explicit
    // resume would ever clear it, so one transient ad-server error killed the slot for good. The
    // SDK's refresh controller keeps the normal interval; a persistent Prebid transport failure is
    // separately bounded by its own backoff.
  }

  // The publisher-facing commands, not visibility reporting. They map to the SDK's durable
  // publisher pause, so a scroll back into view or a page impression cannot silently undo them.
  // The ad-unit methods they used to call became no-ops when the SDK took over refresh scheduling.
  fun stopAutoRefresh() {
    adViewHandler?.stopAutoRefresh()
  }

  fun resumeAutoRefresh() {
    adViewHandler?.resumeAutoRefresh()
  }

  /** Retains the handler created in the manager so [reloadIfVisible] can reload. */
  fun updatePageKey(value: String?) {
    pageKey = value
  }

  fun getPageKey(): String? = pageKey

  fun updateAdViewHandler(value: AudienzzAdViewHandler) {
    // Retire the predecessor. A prop change rebuilds the ad view and handler, and overwriting the
    // reference left the old handler registered with the page coordinator and retained by
    // AppForegroundMonitor — still holding its GAM view and Activity.
    adViewHandler?.destroy()
    adViewHandler = value
  }

  /**
   * Force a fresh auction now, but only when the banner is actually on screen.
   * The pageImpression broadcast reaches every mounted banner, including those
   * on inactive (kept-mounted) screens; skip those so we don't burn an auction.
   */
  fun reloadIfVisible() {
    if (!isShown) return
    if (!getGlobalVisibleRect(android.graphics.Rect())) return
    adViewHandler?.reloadAd()
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

  fun updateSmartRefresh(value: Boolean) {
    smartRefresh = value
  }

  fun getSmartRefresh(): Boolean {
    return smartRefresh
  }

  fun updatePrefetchMarginDp(value: Int) {
    prefetchMarginDp = value
  }

  fun getPrefetchMarginDp(): Int {
    return prefetchMarginDp
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

  /**
   * Tear down the Prebid handler: stops refresh, destroys the ad unit, and — importantly —
   * deregisters from the page coordinator and AppForegroundMonitor, both of which otherwise keep
   * this view (and its Activity) reachable after React drops it.
   */
  // Handler.removeCallbacks only removes messages whose target is THIS handler instance, so the
  // scheduling handler has to be the same object that cancels. Constructing a second
  // Handler(Looper.getMainLooper()) to cancel is a silent no-op even though the Looper matches.
  private val adCreationHandler = android.os.Handler(android.os.Looper.getMainLooper())
  private var pendingAdCreation: Runnable? = null

  /** Schedules delayed ad creation so [cancelPendingAdCreation] can actually drop it. */
  fun scheduleAdCreation(task: Runnable, delayMillis: Long) {
    cancelPendingAdCreation()
    pendingAdCreation = task
    adCreationHandler.postDelayed(task, delayMillis)
  }

  fun cancelPendingAdCreation() {
    pendingAdCreation?.let { adCreationHandler.removeCallbacks(it) }
    pendingAdCreation = null
  }

  fun destroyAdViewHandler() {
    adViewHandler?.destroy()
    adViewHandler = null
  }
}
