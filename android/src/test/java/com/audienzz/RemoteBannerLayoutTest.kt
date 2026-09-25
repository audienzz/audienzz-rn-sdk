package com.audienzz

import android.view.Gravity
import android.view.View
import android.widget.FrameLayout
import com.facebook.react.bridge.*
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.admanager.AdManagerAdView
import io.mockk.*
import org.audienzz.mobile.AudienzzRemoteBannerView
import org.junit.*
import org.junit.Assert.*
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28], manifest = Config.NONE, qualifiers = "xxhdpi")
class RemoteBannerLayoutTest {
  private lateinit var view: RCTRemoteConfigBannerView
  private lateinit var banner: AudienzzRemoteBannerView
  private lateinit var listener: AdListener
  private lateinit var creative: View
  private var servedSize = AdSize(300, 250)

  @Before fun setup() {
    mockkStatic(Arguments::class)
    every { Arguments.createMap() } answers { JavaOnlyMap() }
    val context = spyk(BridgeReactContext(RuntimeEnvironment.getApplication()))
    every { context.getJSModule(RCTEventEmitter::class.java) } returns mockk(relaxed = true)
    view = RCTRemoteConfigBannerView(context)
    view.updateConfigId("46")
  }

  @After fun cleanup() { view.destroy(); unmockkAll() }

  private fun px(dp: Int) = (dp * view.resources.displayMetrics.density).toInt()
  private fun exact(dp: Int) = View.MeasureSpec.makeMeasureSpec(px(dp), View.MeasureSpec.EXACTLY)

  private fun load() {
    view.loadAd()
    // Keep real FrameLayouts; spying on View copies framework state and does not model layout.
    banner = view.getChildAt(0) as AudienzzRemoteBannerView
    val google = mockk<AdManagerAdView>(relaxed = true)
    every { google.adSize } answers { servedSize }
    AudienzzRemoteBannerView::class.java.getDeclaredField("adView").apply {
      isAccessible = true
      set(banner, google)
    }
    listener = AudienzzRemoteBannerView::class.java.getDeclaredField("externalAdListener").run {
      isAccessible = true
      get(banner) as AdListener
    }
    creative = View(view.context)
    banner.addView(creative)
  }

  private fun reactLayout(width: Int, height: Int) {
    // Yoga lays the native host out at an offset; native child layout must not move this host.
    view.measure(exact(width), exact(height))
    view.layout(90, 600, 90 + px(width), 600 + px(height))
    // Execute the posted child-layout pass after Yoga supplies the host's bounds.
    (RCTRemoteConfigBannerView::class.java.getDeclaredField("measureAndLayout").run {
      isAccessible = true
      get(view) as Runnable
    }).run()
  }

  @Test fun `fixed slot keeps its reserved geometry before the first response`() {
    view.updateAdWidth(300)
    view.updateAdHeight(250)
    load()
    reactLayout(300, 250)
    assertEquals(px(250), view.height)
    assertEquals(0, banner.top)
    assertEquals(px(250), banner.height)
  }

  @Test fun `a fixed placement follows every creative size without a negative child offset`() {
    view.updateAdWidth(300)
    view.updateAdHeight(250)
    load()
    reactLayout(300, 250)
    for (size in listOf(AdSize(300, 250), AdSize(320, 50), AdSize(300, 600), AdSize(300, 250))) {
      servedSize = size
      creative.layoutParams = FrameLayout.LayoutParams(px(size.width), px(size.height), Gravity.TOP or Gravity.CENTER_HORIZONTAL)
      listener.onAdLoaded()
      reactLayout(size.width, size.height)
      assertEquals("child must start within its slot for $size", 0, banner.top)
      assertEquals(px(size.width), banner.width)
      assertEquals(px(size.height), banner.height)
      assertEquals(0, creative.top)
      assertEquals(px(size.height), creative.height)
      assertEquals(600, view.top)
    }
  }

  @Test fun `adaptive creative stays centered inside a wider React Native host`() {
    load()
    servedSize = AdSize(320, 250)
    creative.layoutParams = FrameLayout.LayoutParams(px(320), px(250))
    listener.onAdLoaded()
    reactLayout(360, 250)
    assertEquals(px(360), view.width)
    assertEquals(px(320), banner.width)
    assertEquals(px(20), banner.left)
    assertEquals(0, banner.top)
    assertEquals(px(250), creative.height)
  }
}
