package com.audienzz

import android.app.Activity
import android.view.View
import android.widget.FrameLayout
import com.facebook.react.bridge.BridgeReactContext
import com.google.android.gms.ads.AdSize
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Robolectric
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28], manifest = Config.NONE, qualifiers = "xxhdpi")
class BannerLayoutNotificationTest {
  @Test fun `original banner notifies its attached creative after layout without scrolling`() {
    checkNotifications { RCTOriginalBannerView(it) }
  }

  @Test fun `rendering banner notifies its attached creative after layout without scrolling`() {
    checkNotifications { RCTRenderingBannerView(it) }
  }

  private fun checkNotifications(create: (BridgeReactContext) -> FrameLayout) {
    val controller = Robolectric.buildActivity(Activity::class.java).setup().visible()
    try {
      val activity = controller.get()
      val host = create(BridgeReactContext(activity))
      val creative = View(activity)
      host.addView(creative)
      activity.setContentView(host)
      assertTrue("The creative must share its attached host's tree observer", creative.isAttachedToWindow)
      assertSame(host.viewTreeObserver, creative.viewTreeObserver)
      val density = activity.resources.displayMetrics.density
      fun px(dp: Int) = (dp * density).toInt()
      val observedSizes = mutableListOf<Pair<Int, Int>>()
      // Listen from the creative's subtree, where GAM observes visibility. Do not emit
      // fake impressions: this test verifies the real Android geometry notification.
      creative.viewTreeObserver.addOnGlobalLayoutListener {
        observedSizes.add(creative.width to creative.height)
      }
      val childLayout = host.javaClass.getDeclaredField("measureAndLayout").run {
        isAccessible = true
        get(host) as Runnable
      }
      val sizes = listOf(AdSize(300, 250), AdSize(320, 50), AdSize(300, 250))
      for (size in sizes) {
        creative.layoutParams = FrameLayout.LayoutParams(px(size.width), px(size.height))
        if (host is RCTOriginalBannerView) host.setSize(size)
        // Yoga supplies the frame directly. There is no platform layout traversal or
        // scroll between this and the bridge's posted child-layout task.
        host.measure(
          View.MeasureSpec.makeMeasureSpec(px(360), View.MeasureSpec.EXACTLY),
          View.MeasureSpec.makeMeasureSpec(px(size.height), View.MeasureSpec.EXACTLY),
        )
        host.layout(60, 120, 60 + px(360), 120 + px(size.height))
        childLayout.run()
      }
      assertEquals(sizes.map { px(it.width) to px(it.height) }, observedSizes)
    } finally {
      controller.pause().stop().destroy()
    }
  }
}
