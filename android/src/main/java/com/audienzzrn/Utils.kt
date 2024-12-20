package com.audienzz

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

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import org.audienzz.mobile.AudienzzContentObject
import org.audienzz.mobile.AudienzzDataObject

object Utils {
  fun readableArrayToSet(array: ReadableArray): Set<String> {
    val set = HashSet<String>()
    for (i in 0 until array.size()) {
      val keyword = array.getString(i)
      set.add(keyword)
    }
    return set
  }

  fun createContentObject(currentContentObject: ReadableMap): AudienzzContentObject {
    val categoriesArr = currentContentObject.getArray("categories")
    val adaptedCategories = if (categoriesArr != null) {
      val stringList = ArrayList<String>()
      for (i in 0 until categoriesArr.size()) {
        val item = categoriesArr.getString(i)
        stringList.add(item)
      }
      stringList
    } else {
      arrayListOf()
    }

    val dataObject = currentContentObject.getMap("dataObject")?.let {
      AudienzzDataObject().apply {
        id = it.getString("id")
        name = it.getString("name")
        setSegments(it.getArray("segments")?.let { array ->
          val segmentList = ArrayList<AudienzzDataObject.AudienzzSegmentObject>()
          for (i in 0 until array.size()) {
            val map = array.getMap(i)
            map.let { segmentMap ->
              val segment = AudienzzDataObject.AudienzzSegmentObject().apply {
                id = segmentMap.getString("id")
                name = segmentMap.getString("name")
                value = segmentMap.getString("value")
              }
              segmentList.add(segment)
            }
          }
          segmentList
        } ?: ArrayList())
      }
    }

    val adaptedProducer = currentContentObject.getMap("producerObject")?.let {
      val categoryList = ArrayList<String>()
      it.getArray("categories")?.let { array ->
        for (i in 0 until array.size()) {
          val category = array.getString(i)
          categoryList.add(category)
        }
      }
      AudienzzContentObject.AudienzzProducerObject().apply {
        id = it.getString("id")
        name = it.getString("name")
        domain = it.getString("domain")
        setCategories(categoryList)
      }
    }

    return AudienzzContentObject().apply {
      id = if (currentContentObject.hasKey("id")) currentContentObject.getString("id") else null
      episode = if (currentContentObject.hasKey("episode")) currentContentObject.getInt("episode") else null
      title = if (currentContentObject.hasKey("title")) currentContentObject.getString("title") else null
      series = if (currentContentObject.hasKey("series")) currentContentObject.getString("series") else null
      season = if (currentContentObject.hasKey("season")) currentContentObject.getString("season") else null
      artist = if (currentContentObject.hasKey("artist")) currentContentObject.getString("artist") else null
      genre = if (currentContentObject.hasKey("genre")) currentContentObject.getString("genre") else null
      album = if (currentContentObject.hasKey("album")) currentContentObject.getString("album") else null
      isrc = if (currentContentObject.hasKey("isrc")) currentContentObject.getString("isrc") else null
      url = if (currentContentObject.hasKey("url")) currentContentObject.getString("url") else null
      categories = adaptedCategories
      productionQuality = if (currentContentObject.hasKey("productionQuality")) currentContentObject.getInt("productionQuality") else null
      context = if (currentContentObject.hasKey("context")) currentContentObject.getInt("context") else null
      contentRating = if (currentContentObject.hasKey("contentRating")) currentContentObject.getString("contentRating") else null
      userRating = if (currentContentObject.hasKey("userRating")) currentContentObject.getString("userRating") else null
      qaMediaRating = if (currentContentObject.hasKey("qaMediaRating")) currentContentObject.getInt("qaMediaRating") else null
      keywords = if (currentContentObject.hasKey("keywords")) currentContentObject.getString("keywords") else null
      liveStream = if (currentContentObject.hasKey("liveStream")) currentContentObject.getInt("liveStream") else null
      sourceRelationship = if (currentContentObject.hasKey("sourceRelationship")) currentContentObject.getInt("sourceRelationship") else null
      length = if (currentContentObject.hasKey("length")) currentContentObject.getInt("length") else null
      language = if (currentContentObject.hasKey("language")) currentContentObject.getString("language") else null
      embeddable = if (currentContentObject.hasKey("embeddable")) currentContentObject.getInt("embeddable") else null
      setDataList(dataObject?.let { arrayListOf(it) } ?: arrayListOf())
      producer = adaptedProducer
    }
  }
}
