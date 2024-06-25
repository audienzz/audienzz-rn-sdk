package com.audienzzrn

import android.content.Context
import android.net.Uri
import android.util.Log
import android.widget.FrameLayout
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.SimpleExoPlayer
import com.google.android.exoplayer2.ext.ima.ImaAdsLoader
import com.google.android.exoplayer2.source.MediaSource
import com.google.android.exoplayer2.source.ProgressiveMediaSource
import com.google.android.exoplayer2.source.ads.AdsMediaSource
import com.google.android.exoplayer2.ui.PlayerView
import com.google.android.exoplayer2.upstream.DataSource
import com.google.android.exoplayer2.upstream.DataSpec
import com.google.android.exoplayer2.upstream.DefaultDataSourceFactory
import org.audienzz.mobile.AudienzzAdSize
import org.audienzz.mobile.AudienzzInStreamVideoAdUnit
import org.audienzz.mobile.AudienzzSignals
import org.audienzz.mobile.AudienzzUtil
import org.audienzz.mobile.AudienzzVideoParameters
import org.audienzz.mobile.api.data.AudienzzBidInfo

class RCTOriginalInStreamView(context: Context) : FrameLayout(context) {
  companion object {
    var INSTREAM_VIEW_TAG = "RCTOriginalInStreamViewTag"
    private var TAG_LOGCAT = "RCTOriginalInStreamView"
    private var playbackMethods: List<String> = listOf()
    private var apiParameters: List<String> = listOf()
    private var videoProtocols: List<String> = listOf()
    private var videoBitrate: List<Int> = listOf()
    private var videoDuration: List<Int> = listOf()
    private var AD_UNIT_ID: String = ""
    private var AU_CONFIG_ID: String = ""
    private var VIDEO_URL: String = ""
    private var WIDTH: Int = 0
    private var HEIGHT: Int = 0
  }

  private var auInStreamView: AudienzzInStreamVideoAdUnit? = null
  private var player: SimpleExoPlayer? = null
  private var adsUri: Uri? = null
  private var adsLoader: ImaAdsLoader? = null
  private var playerView: PlayerView? = null

  init {
    tag = INSTREAM_VIEW_TAG
  }

  private fun convertToAudienzzApi(apiString: String): AudienzzSignals.Api? {
    return when (apiString) {
      "VPAID_1" -> AudienzzSignals.Api.VPAID_1
      "VPAID_2" -> AudienzzSignals.Api.VPAID_2
      "MRAID_1" -> AudienzzSignals.Api.MRAID_1
      "ORMMA" -> AudienzzSignals.Api.ORMMA
      "MRAID_2" -> AudienzzSignals.Api.MRAID_2
      "MRAID_3" -> AudienzzSignals.Api.MRAID_3
      "OMID_1" -> AudienzzSignals.Api.OMID_1
      else -> null
    }
  }

  private fun convertToAudienzzVideoProtocols(protocolsString: String): AudienzzSignals.Protocols? {
    return when (protocolsString) {
      "VAST_1_0" -> AudienzzSignals.Protocols.VAST_1_0
      "VAST_2_0" -> AudienzzSignals.Protocols.VAST_2_0
      "VAST_3_0" -> AudienzzSignals.Protocols.VAST_3_0
      "VAST_4_0" -> AudienzzSignals.Protocols.VAST_4_0
      "DAAST_1_0" -> AudienzzSignals.Protocols.DAAST_1_0
      "VAST_1_0_Wrapped" -> AudienzzSignals.Protocols.VAST_1_0_WRAPPER
      "VAST_2_0_Wrapped" -> AudienzzSignals.Protocols.VAST_2_0_WRAPPER
      "VAST_3_0_Wrapped" -> AudienzzSignals.Protocols.VAST_3_0_WRAPPER
      "VAST_4_0_Wrapped" -> AudienzzSignals.Protocols.VAST_4_0_WRAPPER
      "DAAST_1_0_Wrapped" -> AudienzzSignals.Protocols.DAAST_1_0_WRAPPER
      else -> null
    }
  }

  private fun convertToAudienzzPlaybackMethod(playbackMethodString: String): AudienzzSignals.PlaybackMethod? {
    return when (playbackMethodString) {
      "AutoPlaySoundOn" -> AudienzzSignals.PlaybackMethod.AutoPlaySoundOn
      "AutoPlaySoundOff" -> AudienzzSignals.PlaybackMethod.AutoPlaySoundOff
      "ClickToPlay" -> AudienzzSignals.PlaybackMethod.ClickToPlay
      "MouseOver" -> AudienzzSignals.PlaybackMethod.MouseOver
      "EnterSoundOn" -> AudienzzSignals.PlaybackMethod.EnterSoundOn
      "EnterSoundOff" -> AudienzzSignals.PlaybackMethod.EnterSoundOff
      else -> null
    }
  }

  override fun requestLayout() {
    super.requestLayout()

    post(measureAndLayout)
  }

  private val measureAndLayout = Runnable {
    val heightMeasureSpec = MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)

    measure(MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY), heightMeasureSpec)
    layout(left, top, right, top + height)
  }

  private fun createPlayer() {
    adsLoader = ImaAdsLoader.Builder(context).build()
    val playerBuilder = SimpleExoPlayer.Builder(context)

    player = playerBuilder.build()
    playerView?.player = player
    adsLoader?.setPlayer(player)

    val uri = Uri.parse(VIDEO_URL)
    val mediaItem = MediaItem.fromUri(uri)
    val dataSourceFactory: DataSource.Factory = DefaultDataSourceFactory(context)
    val mediaSourceFactory = ProgressiveMediaSource.Factory(dataSourceFactory)
    val mediaSource: MediaSource = mediaSourceFactory.createMediaSource(mediaItem)
    val dataSpec = DataSpec(adsUri!!)
    val adsMediaSource = AdsMediaSource(
      mediaSource, dataSpec, "ad", mediaSourceFactory,
      adsLoader!!, playerView!!
    )

    player?.setMediaSource(adsMediaSource)
    player?.playWhenReady = true
    player?.prepare()
  }

  private fun createAd() {
    Log.d(TAG_LOGCAT, ">>> WIDTH AND HEIGHT $WIDTH $HEIGHT")
    auInStreamView = AudienzzInStreamVideoAdUnit(AU_CONFIG_ID, WIDTH, HEIGHT)

    val videoParameters = AudienzzVideoParameters(listOf("video/x-flv", "video/mp4"))

    val allowedApis = mutableListOf<AudienzzSignals.Api>()
    val allowedPlaybackMethods = mutableListOf<AudienzzSignals.PlaybackMethod>()
    val allowedProtocols = mutableListOf<AudienzzSignals.Protocols>()

    for (apiString in apiParameters) {
      val api = convertToAudienzzApi(apiString)

      if (api != null) {
        allowedApis.add(api)
      }
    }

    for (protocolString in videoProtocols) {
      val protocol = convertToAudienzzVideoProtocols(protocolString)

      if (protocol != null) {
        allowedProtocols.add(protocol)
      }
    }

    for (playbackMethodString in playbackMethods) {
      val playbackMethod = convertToAudienzzPlaybackMethod(playbackMethodString)

      if (playbackMethod != null) {
        allowedPlaybackMethods.add(playbackMethod)
      }
    }

    videoParameters.api = allowedApis
    videoParameters.protocols = allowedProtocols
    videoParameters.playbackMethod = allowedPlaybackMethods
    videoParameters.placement = AudienzzSignals.Placement.InStream
    videoParameters.minDuration = videoDuration[0]
    videoParameters.maxDuration = videoDuration[1]
    videoParameters.minBitrate = videoBitrate[0]
    videoParameters.maxBitrate = videoBitrate[1]

    Log.d(TAG_LOGCAT, ">>> videoParameters.api ${videoParameters.api}")
    Log.d(TAG_LOGCAT, ">>> videoParameters.playbackMethod ${videoParameters.playbackMethod}")
    Log.d(TAG_LOGCAT, ">>> videoParameters.protocols ${videoParameters.protocols}")
    Log.d(TAG_LOGCAT, ">>> videoParameters.placement ${videoParameters.placement}")
    Log.d(TAG_LOGCAT, ">>> bitrate $videoBitrate")
    Log.d(TAG_LOGCAT, ">>> duration $videoDuration")

    auInStreamView?.videoParameters = videoParameters

    playerView = PlayerView(context)
    addView(playerView)

    auInStreamView?.fetchDemand { bidInfo: AudienzzBidInfo ->
      val sizes = HashSet<AudienzzAdSize>()
      sizes.add(AudienzzAdSize(WIDTH, HEIGHT))

      val prebidURL = AudienzzUtil.generateInstreamUriForGam(
        AD_UNIT_ID,
        sizes,
        bidInfo.targetingKeywords
      )

      adsUri = Uri.parse(prebidURL)

      createPlayer()
    }
  }

  fun updateApiParameters(currentApiParameters: List<String>) {
    apiParameters = currentApiParameters
  }

  fun updateVideoProtocols(currentVideoProtocols: List<String>) {
    videoProtocols = currentVideoProtocols
  }

  fun updatePlaybackMethod(currentPlaybackMethods: List<String>) {
    playbackMethods = currentPlaybackMethods
  }

  fun updateVideoBitrate(currentVideoBitrate: List<Int>) {
    videoBitrate = currentVideoBitrate;
  }

  fun updateVideoDuration(currentVideoDuration: List<Int>) {
    videoDuration = currentVideoDuration;
  }

  fun updateVideoUrl(videoUrl: String) {
    VIDEO_URL = videoUrl
  }

  fun updateAuConfigID(auConfigID: String) {
    AU_CONFIG_ID = auConfigID
  }

  fun updateSizesForRequest(sizesForRequest: String) {
    when (sizesForRequest) {
      "640x480" -> {
        WIDTH = 640
        HEIGHT = 480
      }
      "400x300" -> {
        WIDTH = 400
        HEIGHT = 300
      }
    }
  }

  fun updateAdUnitID(adUnitID: String) {
    AD_UNIT_ID = adUnitID

    if (AD_UNIT_ID != "" && AU_CONFIG_ID != "") {
      createAd()
    }
  }
}
