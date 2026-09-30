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
  private val nativeLifecyclePayloads = mutableListOf<Map<String, Any?>>()

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
    // Keep the map the bridge BUILT — that is what the readiness assertions are about.
    view.toJsMap = { payload -> nativeLifecyclePayloads += payload; JavaOnlyMap() }
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
    verify(exactly = 0) { ad.prefetch() }
    verify(exactly = 0) { ad.prefetchAndShow() }
    // any(): the bridge releases through destroy(reason). Checking the no-arg overload, as this
    // used to, could never fail.
    verify(exactly = 0) { ad.destroy(any()) }
    view.prefetch()
    verify(exactly = 1) { ad.prefetch() }
  }

  @Test fun `no Activity skips now without replay on loaded callback`() {
    view.show(true)
    events.onLoaded()
    verify(exactly = 0) { ad.show(any(), any()) }
    verify(exactly = 1) { emitter.receiveEvent(any(), "onLifecycleEvent", any()) }
  }

  @Test fun `manager supports numeric and string show commands and passes eligibility`() {
    val host = mockk<Activity>()
    every { context.currentActivity } returns host
    val args = mockk<ReadableArray>()
    every { args.size() } returns 1
    every { args.getBoolean(0) } returns false
    val manager = RCTRemoteConfigInterstitialManager()
    manager.receiveCommand(view, 2, args)
    manager.receiveCommand(view, "show", args)
    verify(exactly = 2) { ad.show(host, false) }
  }

  @Test fun `configuration change invalidates old callbacks before release`() {
    val stale = events
    view.setAdConfigId("268")
    view.createAd()
    stale.onLoaded()
    verify(exactly = 0) { emitter.receiveEvent(any(), "onAdLoaded", any()) }
    // "replaced", not "disposed": it becomes the reason on discardedWithoutImpression.
    verify(exactly = 1) { ad.destroy("replaced") }
    events.onLoaded()
    verify(exactly = 1) { emitter.receiveEvent(any(), "onAdLoaded", any()) }
  }

  @Test fun `dispose is terminal and prevents stale callbacks and commands`() {
    view.dispose()
    events.onLoaded()
    view.prefetch()
    view.show(true)
    view.createAd()
    verify(exactly = 1) { ad.destroy("disposed") }
    verify(exactly = 0) { ad.prefetch() }
    verify(exactly = 0) { emitter.receiveEvent(any(), any(), any()) }
    org.junit.Assert.assertEquals(1, creations)
  }

  @Test fun `legacy mount starts exactly one prefetch-and-show, and repeated mounts add none`() {
    view.setManualControl(false)
    view.createAd()
    view.createAd()
    verify(exactly = 1) { ad.prefetchAndShow() }
  }

  @Test fun `manual commands in legacy mode are forwarded, not dropped`() {
    // This used to assert the opposite — that the bridge ignored them. Native now coalesces a
    // second load into the one in flight, so a bridge that swallowed the command would only lose
    // the caller's intent; that silent drop was the RN iOS bug fixed alongside the prefetch/show
    // contract. Coalescing is native's job and is tested there.
    view.setManualControl(false)
    view.createAd()
    view.prefetch()
    verify(exactly = 1) { ad.prefetch() }
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

  @Test fun `a native lifecycle event carries native readiness`() {
    // JS cannot query readiness — view commands return nothing — so isReady() in JS is built
    // entirely from this flag.
    every { ad.isReady } returns true
    events.onLifecycleEvent(mapOf("event" to "loaded"))
    org.junit.Assert.assertEquals(
      listOf(mapOf("event" to "loaded", "ready" to true)),
      nativeLifecyclePayloads,
    )
    verify(exactly = 1) { emitter.receiveEvent(any(), "onLifecycleEvent", any()) }
  }

  @Test fun `the reported readiness is native's, not inferred from the event name`() {
    every { ad.isReady } returns false
    events.onLifecycleEvent(mapOf("event" to "loaded"))
    org.junit.Assert.assertEquals(false, nativeLifecyclePayloads.single()["ready"])
  }

  @Test fun `the bridge's own opportunitySkipped carries readiness too`() {
    // No Activity: the bridge makes this event up itself, so it has to add the flag itself.
    every { ad.isReady } returns true
    view.show(true)
    verify(exactly = 1) {
      emitter.receiveEvent(any(), "onLifecycleEvent", match {
        it?.getString("event") == "opportunitySkipped" && it.getBoolean("ready")
      })
    }
  }

  @Test fun `dropping the native view releases its owner and ignores later callbacks`() {
    RCTRemoteConfigInterstitialManager().onDropViewInstance(view)
    events.onLoaded()
    verify(exactly = 1) { ad.destroy("disposed") }
    verify(exactly = 0) { emitter.receiveEvent(any(), any(), any()) }
  }

}
