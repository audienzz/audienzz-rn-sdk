package com.audienzzrn

/*
    Copyright 2024 Audienzz AG

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

import java.util.EnumSet
import org.audienzz.mobile.AudienzzSignals
import org.audienzz.mobile.api.data.AudienzzAdUnitFormat
import org.audienzz.mobile.api.data.AudienzzVideoPlacementType

object AudienzzConversionUtils {
  fun convertToAudienzzAdFormats(adFormats: List<String>): EnumSet<AudienzzAdUnitFormat> {
    val auAdFormats = EnumSet.noneOf(AudienzzAdUnitFormat::class.java)

    for (formatString in adFormats) {
      when (formatString) {
        "banner" -> auAdFormats.add(AudienzzAdUnitFormat.BANNER)
        "video" -> auAdFormats.add(AudienzzAdUnitFormat.VIDEO)
      }
    }

    return auAdFormats
  }

  fun convertToAudienzzAdFormat(formatString: String): EnumSet<AudienzzAdUnitFormat> {
    val auAdFormats = EnumSet.noneOf(AudienzzAdUnitFormat::class.java)

    when (formatString) {
      "banner" -> auAdFormats.add(AudienzzAdUnitFormat.BANNER)
      "video" -> auAdFormats.add(AudienzzAdUnitFormat.VIDEO)
    }

    return auAdFormats
  }

  fun convertToAudienzzApi(apiString: String): AudienzzSignals.Api? {
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

  fun convertToAudienzzVideoProtocols(protocolsString: String): AudienzzSignals.Protocols? {
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

  fun convertToAudienzzPlaybackMethod(playbackMethodString: String): AudienzzSignals.PlaybackMethod? {
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

  fun convertToAudienzzVideoPlacement(placementString: String): AudienzzSignals.Placement? {
    return when (placementString) {
      "inArticle" -> AudienzzSignals.Placement.InArticle
      "inFeed" -> AudienzzSignals.Placement.InFeed
      "interstitial" -> AudienzzSignals.Placement.Interstitial
      else -> AudienzzSignals.Placement.InBanner
    }
  }

  fun convertToAudienzzVideoPlacementType(placementString: String): AudienzzVideoPlacementType? {
    return when (placementString) {
      "inArticle" -> AudienzzVideoPlacementType.IN_ARTICLE
      "inFeed" -> AudienzzVideoPlacementType.IN_FEED
      else -> AudienzzVideoPlacementType.IN_BANNER
    }
  }
}

