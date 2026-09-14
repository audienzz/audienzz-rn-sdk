package com.audienzz

import android.app.Activity
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.BridgeReactContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.JavaOnlyMap
import com.google.android.gms.ads.AdError
import com.facebook.react.uimanager.events.RCTEventEmitter
import io.mockk.*
import org.audienzz.mobile.AudienzzRemoteConfigInterstitial
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config
import org.junit.runner.RunWith

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28], manifest = Config.NONE)
class RemoteConfigInterstitialBridgeTest {
  private lateinit var view: RCTRemoteConfigInterstitialView
  private lateinit var context: ReactApplicationContext
  private lateinit var ad: AudienzzRemoteConfigInterstitial
  private lateinit var events: AudienzzRemoteConfigInterstitial.Events
  private lateinit var emitter: RCTEventEmitter
  private var creations = 0

  @Before fun setup() {
    mockkStatic(Arguments::class)
    every { Arguments.createMap() } answers { JavaOnlyMap() }
    context = spyk(BridgeReactContext(RuntimeEnvironment.getApplication()))
    emitter = mockk(relaxed = true)
    every { context.getJSModule(RCTEventEmitter::class.java) } returns emitter
    every { context.currentActivity } returns null
    ad = mockk(relaxed = true)
    view = RCTRemoteConfigInterstitialView(context)
    view.interstitialFactory = { _, _, callbacks -> creations++; events = callbacks; ad }
    view.setAdConfigId("267")
    view.setManualControl(true)
    view.createAd()
  }
  @After fun teardown() { view.dispose(); unmockkAll() }

  @Test fun `manual mount and repeated transactions never load or replace the owner`() {
    view.createAd()
    view.setAdConfigId("267")
    view.createAd()
    org.junit.Assert.assertEquals(1, creations)
    verify(exactly = 0) { ad.loadAd() }
    verify(exactly = 0) { ad.destroy() }
    view.preload()
    verify(exactly = 1) { ad.preload() }
  }

  @Test fun `no Activity skips now without replay on loaded callback`() {
    view.showAtOpportunity(true)
    events.onLoaded()
    verify(exactly = 0) { ad.showAtOpportunity(any(), any()) }
    verify(exactly = 1) { emitter.receiveEvent(any(), "onLifecycleEvent", any()) }
  }

  @Test fun `manager supports numeric and string opportunity commands and passes eligibility`() {
    val host = mockk<Activity>()
    every { context.currentActivity } returns host
    val args = mockk<ReadableArray>()
    every { args.size() } returns 1
    every { args.getBoolean(0) } returns false
    val manager = RCTRemoteConfigInterstitialManager()
    manager.receiveCommand(view, 2, args)
    manager.receiveCommand(view, "showAtOpportunity", args)
    verify(exactly = 2) { ad.showAtOpportunity(host, false) }
  }

  @Test fun `configuration change invalidates old callbacks before release`() {
    val stale = events
    view.setAdConfigId("268")
    view.createAd()
    stale.onLoaded()
    verify(exactly = 0) { emitter.receiveEvent(any(), "onAdLoaded", any()) }
    verify(exactly = 1) { ad.destroy() }
    events.onLoaded()
    verify(exactly = 1) { emitter.receiveEvent(any(), "onAdLoaded", any()) }
  }

  @Test fun `dispose is terminal and prevents stale callbacks and commands`() {
    view.dispose()
    events.onLoaded()
    view.preload()
    view.showAtOpportunity(true)
    view.createAd()
    verify(exactly = 1) { ad.destroy() }
    verify(exactly = 0) { ad.preload() }
    verify(exactly = 0) { emitter.receiveEvent(any(), any(), any()) }
    org.junit.Assert.assertEquals(1, creations)
  }

  @Test fun `legacy mount loads once and manual commands cannot start a second flow`() {
    view.setManualControl(false)
    view.createAd()
    view.createAd()
    view.preload()
    view.showAtOpportunity(true)
    verify(exactly = 1) { ad.loadAd() }
    verify(exactly = 0) { ad.preload() }
    verify(exactly = 0) { ad.showAtOpportunity(any(), any()) }
  }
  @Test fun `Google presentation failure reaches its own callback with original diagnostics`() {
    events.onFailedToShow(AdError(7, "cannot present", "Google"))
    verify(exactly = 1) {
      emitter.receiveEvent(any(), "onAdFailedToShow", match {
        it?.getInt("code") == 7 && it.getString("message") == "cannot present" && it.getString("domain") == "Google"
      })
    }
    verify(exactly = 0) { emitter.receiveEvent(any(), "onAdFailedToLoad", any()) }
  }

  @Test fun `dropping the native view releases its owner and ignores later callbacks`() {
    RCTRemoteConfigInterstitialManager().onDropViewInstance(view)
    events.onLoaded()
    verify(exactly = 1) { ad.destroy() }
    verify(exactly = 0) { emitter.receiveEvent(any(), any(), any()) }
  }

}
