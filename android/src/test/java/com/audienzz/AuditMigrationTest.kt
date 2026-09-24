package com.audienzz

import android.app.Activity
import android.view.View
import com.facebook.react.bridge.*
import com.facebook.react.uimanager.events.RCTEventEmitter
import io.mockk.*
import org.audienzz.mobile.AudienzzPrebidMobile
import org.audienzz.mobile.api.data.AudienzzInitializationStatus
import org.audienzz.mobile.rendering.listeners.AudienzzSdkInitializationListener
import org.audienzz.mobile.original.AudienzzRewardedVideoAdHandler
import org.audienzz.mobile.original.callbacks.AudienzzFullScreenContentCallback
import org.audienzz.mobile.original.callbacks.AudienzzRewardedAdLoadCallback
import org.audienzz.mobile.util.lazyAdLoader
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28], manifest = Config.NONE)
class AuditMigrationTest {
  private lateinit var context: BridgeReactContext
  private lateinit var emitter: RCTEventEmitter

  @Before fun setup() {
    mockkStatic(Arguments::class)
    every { Arguments.createMap() } answers { JavaOnlyMap() }
    context = spyk(BridgeReactContext(RuntimeEnvironment.getApplication()))
    emitter = mockk(relaxed = true)
    every { context.getJSModule(RCTEventEmitter::class.java) } returns emitter
    every { context.currentActivity } returns null
  }

  @After fun cleanup() { unmockkAll() }

  @Test fun `remote setup rejects a backend the released Android SDK would ignore`() {
    val module = RNAudienzzModule(context)
    for (url in listOf(
      "https://dev-api.adnz.co/api/ws-sdk-config/public/v1/",
      "https://api.adnz.co/api/ws-sdk-config/public/v2/",
      "https://api.adnz.co/api/ws-sdk-config/public/v1/?environment=dev",
    )) {
      val promise = mockk<Promise>(relaxed = true)
      module.configureRemote(url, "81", promise)
      verify(exactly = 1) { promise.reject("UNSUPPORTED_REMOTE_URL", any<String>()) }
      verify(exactly = 0) { promise.resolve(any()) }
    }
    module.invalidate()
  }

  @Test fun `remote setup accepts the production endpoint with or without a trailing slash`() {
    val module = RNAudienzzModule(context)
    for (suffix in listOf("", "/")) {
      val promise = mockk<Promise>(relaxed = true)
      module.configureRemote("https://api.adnz.co/api/ws-sdk-config/public/v1$suffix", "35", promise)
      verify(exactly = 1) { promise.resolve(null) }
      verify(exactly = 0) { promise.reject(any<String>(), any<String>()) }
    }
    module.invalidate()
  }

  @Test fun `initialization failure and warning both settle the promise`() {
    // Initialize the Kotlin object before MockK records calls made by its static initializer.
    AudienzzPrebidMobile.hashCode()
    mockkStatic(AudienzzPrebidMobile::class)
    val listener = slot<AudienzzSdkInitializationListener>()
    every { AudienzzPrebidMobile.initializeSdk(any(), any(), any(), any(), capture(listener)) } just Runs
    for (status in listOf(AudienzzInitializationStatus.FAILED, AudienzzInitializationStatus.SERVER_STATUS_WARNING)) {
      val promise = mockk<Promise>(relaxed = true)
      RNAudienzzModule(context).initialize("company", promise)
      listener.captured.onInitializationComplete(status)
      verify(exactly = 1) { promise.reject("INIT_FAILED", any<String>()) }
      verify(exactly = 0) { promise.resolve(any()) }
    }
  }

  @Test fun `each ad creation reports missing Activity without throwing`() {
    val views = listOf(
      RCTOriginalInterstitialView(context), RCTOriginalRewardedView(context),
      RCTRenderingBannerView(context), RCTRenderingInterstitialView(context),
      RCTRenderingRewardedView(context),
    )
    views.forEachIndexed { index, view ->
      view.id = index + 1
      view.createAd()
      verify(exactly = 1) {
        emitter.receiveEvent(index + 1, "onAdFailedToLoad", match {
          it != null && it.getString("message")!!.contains("Activity")
        })
      }
    }
  }

  @Test fun `banner replacement retires old handler even when new props are incomplete`() {
    val view = RCTOriginalBannerView(context)
    val handler = mockk<org.audienzz.mobile.original.AudienzzAdViewHandler>(relaxed = true)
    view.updateAdViewHandler(handler)
    val request = RCTOriginalBannerViewManager::class.java.getDeclaredMethod("requestAd", RCTOriginalBannerView::class.java)
    request.isAccessible = true
    request.invoke(RCTOriginalBannerViewManager(), view)
    verify(exactly = 1) { handler.destroy() }
    view.destroyAdViewHandler()
    verify(exactly = 1) { handler.destroy() }
  }

  @Test fun `dismissal without an earned reward reports zero instead of crashing`() {
    every { context.currentActivity } returns mockk<Activity>(relaxed = true)
    mockkStatic("org.audienzz.mobile.util.ViewUtilKt")
    val fullscreen = slot<AudienzzFullScreenContentCallback>()
    every {
      any<View>().lazyAdLoader(any<AudienzzRewardedVideoAdHandler>(), any(),
        any<AudienzzRewardedAdLoadCallback>(), capture(fullscreen), any())
    } just Runs
    val view = RCTOriginalRewardedView(context)
    view.auConfigID = "test-placement"
    view.adUnitID = "/test/reward"
    view.createAd()
    fullscreen.captured.onAdDismissedFullScreenContent()
    verify(exactly = 1) {
      emitter.receiveEvent(any(), "onAdClosed", match {
        it != null && it.getInt("amount") == 0 && it.getString("type") == ""
      })
    }
    fullscreen.captured.onAdFailedToShowFullScreenContent(
      com.google.android.gms.ads.AdError(7, "cannot present", "Google"))
    verify(exactly = 1) {
      emitter.receiveEvent(any(), "onAdFailedToShow", match {
        it != null && it.getInt("code") == 7 && it.getString("message") == "cannot present"
      })
    }
    view.destroyAd()
  }
}
