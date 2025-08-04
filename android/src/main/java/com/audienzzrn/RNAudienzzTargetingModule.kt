package com.audienzz

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import org.audienzz.mobile.AudienzzTargetingParams
import android.util.Pair
import com.facebook.react.bridge.ReadableArray
import org.audienzz.mobile.AudienzzExternalUserId
import org.json.JSONObject

class RNAudienzzTargetingModule(reactContext: ReactApplicationContext) :
  ReactNativeModule(reactContext, SERVICE) {

  @ReactMethod
    fun setUserLatLng(latitude: Float, longitude: Float) {
      AudienzzTargetingParams.userLatLng = Pair(latitude, longitude)
    }

    @ReactMethod
    fun clearUserLatLng() {
      AudienzzTargetingParams.userLatLng = null
    }

    @ReactMethod
    fun getUserLatLng(promise: Promise) {
      val latLng = AudienzzTargetingParams.userLatLng
      if (latLng != null) {
        val result = Arguments.createMap()
        result.putDouble("latitude", latLng.first.toDouble())
        result.putDouble("longitude", latLng.second.toDouble())
        promise.resolve(result)
      } else {
        promise.resolve(null)
      }
    }

    @ReactMethod
    fun setPublisherName(name: String?) {
      AudienzzTargetingParams.publisherName = name
    }

    @ReactMethod
    fun getPublisherName(promise: Promise) {
      promise.resolve(AudienzzTargetingParams.publisherName)
    }

    @ReactMethod
    fun setDomain(domain: String) {
      AudienzzTargetingParams.domain = domain
    }

    @ReactMethod
    fun getDomain(promise: Promise) {
      promise.resolve(AudienzzTargetingParams.domain)
    }

    @ReactMethod
    fun setStoreUrl(url: String) {
      AudienzzTargetingParams.storeUrl = url
    }

    @ReactMethod
    fun getStoreUrl(promise: Promise) {
      promise.resolve(AudienzzTargetingParams.storeUrl)
    }

    @ReactMethod
    fun setBundleName(bundleName: String?) {
      AudienzzTargetingParams.bundleName = bundleName
    }

    @ReactMethod
    fun getBundleName(promise: Promise) {
      promise.resolve(AudienzzTargetingParams.bundleName)
    }

    @ReactMethod
    fun setOmidPartnerName(name: String?) {
      AudienzzTargetingParams.omidPartnerName = name
    }

    @ReactMethod
    fun getOmidPartnerName(promise: Promise) {
      promise.resolve(AudienzzTargetingParams.omidPartnerName)
    }

    @ReactMethod
    fun setOmidPartnerVersion(version: String?) {
      AudienzzTargetingParams.omidPartnerVersion = version
    }

    @ReactMethod
    fun getOmidPartnerVersion(promise: Promise) {
      promise.resolve(AudienzzTargetingParams.omidPartnerVersion)
    }

    @ReactMethod
    fun setSubjectToCOPPA(isSubject: Boolean?) {
      AudienzzTargetingParams.isSubjectToCOPPA = isSubject
    }

    @ReactMethod
    fun getSubjectToCOPPA(promise: Promise) {
      promise.resolve(AudienzzTargetingParams.isSubjectToCOPPA)
    }

    @ReactMethod
    fun setSubjectToGDPR(isSubject: Boolean?) {
      AudienzzTargetingParams.isSubjectToGDPR = isSubject
    }

    @ReactMethod
    fun getSubjectToGDPR(promise: Promise) {
      promise.resolve(AudienzzTargetingParams.isSubjectToGDPR)
    }

    @ReactMethod
    fun setGDPRConsentString(consent: String?) {
      AudienzzTargetingParams.gdprConsentString = consent
    }

    @ReactMethod
    fun getGDPRConsentString(promise: Promise) {
      promise.resolve(AudienzzTargetingParams.gdprConsentString)
    }

    @ReactMethod
    fun setPurposeConsents(consents: String?) {
      AudienzzTargetingParams.purposeConsents = consents
    }

    @ReactMethod
    fun getPurposeConsents(promise: Promise) {
      promise.resolve(AudienzzTargetingParams.purposeConsents)
    }

    @ReactMethod
    fun getDeviceAccessConsent(promise: Promise) {
      promise.resolve(AudienzzTargetingParams.isDeviceAccessConsent)
    }

    @ReactMethod
    fun getUserKeywords(promise: Promise) {
      promise.resolve(AudienzzTargetingParams.userKeywords)
    }

    @ReactMethod
    fun getKeywordSet(promise: Promise) {
      val keywords = AudienzzTargetingParams.keywordSet
      val array = Arguments.createArray()
      keywords.forEach { array.pushString(it) }
      promise.resolve(array)
    }

    @ReactMethod
    fun addUserKeyword(keyword: String) {
      AudienzzTargetingParams.addUserKeyword(keyword)
    }

    @ReactMethod
    fun addUserKeywords(keywords: ReadableArray) {
      val keywordSet = mutableSetOf<String>()
      for (i in 0 until keywords.size()) {
        keywords.getString(i)?.let { keywordSet.add(it) }
      }
      AudienzzTargetingParams.addUserKeywords(keywordSet)
    }

    @ReactMethod
    fun removeUserKeyword(keyword: String) {
      AudienzzTargetingParams.removeUserKeyword(keyword)
    }

    @ReactMethod
    fun clearUserKeywords() {
      AudienzzTargetingParams.clearUserKeywords()
    }


    @ReactMethod
    fun setExternalUserIds(userIds: ReadableArray?) {
      if (userIds == null) {
        AudienzzTargetingParams.setExternalUserIds(null)
        return
      }

      val externalUserIds = mutableListOf<AudienzzExternalUserId>()
      for (i in 0 until userIds.size()) {
        val userIdMap = userIds.getMap(i)
        val source = userIdMap?.getString("source") ?: continue
        val uniqueIdsArray = userIdMap.getArray("uniqueIds") ?: continue

        val uniqueIds = mutableListOf<AudienzzExternalUserId.AudienzzUniqueId>()
        for (j in 0 until uniqueIdsArray.size()) {
          val uniqueIdMap = uniqueIdsArray.getMap(j)
          val id = uniqueIdMap?.getString("id") ?: continue
          val atype = if (uniqueIdMap.hasKey("atype")) uniqueIdMap.getInt("atype") else continue

          uniqueIds.add(AudienzzExternalUserId.AudienzzUniqueId(id, atype))
        }

        externalUserIds.add(AudienzzExternalUserId(source, uniqueIds))
      }

      AudienzzTargetingParams.setExternalUserIds(externalUserIds)
    }

    @ReactMethod
    fun getExternalUserIds(promise: Promise) {
      val externalUserIds = AudienzzTargetingParams.getExternalUserIds()
      if (externalUserIds == null) {
        promise.resolve(null)
        return
      }

      val array = Arguments.createArray()
      externalUserIds.forEach { externalUserId ->
        val userIdMap = Arguments.createMap()
        userIdMap.putString("source", externalUserId.source)

        //TODO: add ability to get ids
//        val uniqueIdsArray = Arguments.createArray()
//        externalUserId.uniqueIds.forEach { uniqueId ->
//          val uniqueIdMap = Arguments.createMap()
//          uniqueIdMap.putString("id", uniqueId.id)
//          uniqueId.atype?.let { uniqueIdMap.putInt("atype", it) }
//          uniqueIdsArray.pushMap(uniqueIdMap)
//        }
//        userIdMap.putArray("uniqueIds", uniqueIdsArray)
        array.pushMap(userIdMap)
      }

      promise.resolve(array)
    }

    @ReactMethod
    fun getExtDataDictionary(promise: Promise) {
      val extData = AudienzzTargetingParams.extDataDictionary
      val map = Arguments.createMap()
      extData.forEach { (key, values) ->
        val array = Arguments.createArray()
        values.forEach { array.pushString(it) }
        map.putArray(key, array)
      }
      promise.resolve(map)
    }

    @ReactMethod
    fun addExtData(key: String, value: String) {
      AudienzzTargetingParams.addExtData(key, value)
    }

    @ReactMethod
    fun updateExtData(key: String, values: ReadableArray) {
      val valueSet = mutableSetOf<String>()
      for (i in 0 until values.size()) {
        values.getString(i)?.let { valueSet.add(it) }
      }
      AudienzzTargetingParams.updateExtData(key, valueSet)
    }

    @ReactMethod
    fun removeExtData(key: String) {
      AudienzzTargetingParams.removeExtData(key)
    }

    @ReactMethod
    fun clearExtData() {
      AudienzzTargetingParams.clearExtData()
    }

    @ReactMethod
    fun getAccessControlList(promise: Promise) {
      val acl = AudienzzTargetingParams.accessControlList
      val array = Arguments.createArray()
      acl.forEach { array.pushString(it) }
      promise.resolve(array)
    }

    @ReactMethod
    fun addBidderToAccessControlList(bidderName: String) {
      AudienzzTargetingParams.addBidderToAccessControlList(bidderName)
    }

    @ReactMethod
    fun removeBidderFromAccessControlList(bidderName: String) {
      AudienzzTargetingParams.removeBidderFromAccessControlList(bidderName)
    }

    @ReactMethod
    fun clearAccessControlList() {
      AudienzzTargetingParams.clearAccessControlList()
    }

    @ReactMethod
    fun addGlobalTargeting(key: String, value: String) {
      AudienzzTargetingParams.addGlobalTargeting(key, value)
    }

    @ReactMethod
    fun addGlobalTargetingSet(key: String, values: ReadableArray) {
      val valueSet = mutableSetOf<String>()
      for (i in 0 until values.size()) {
        values.getString(i)?.let { valueSet.add(it) }
      }
      AudienzzTargetingParams.addGlobalTargeting(key, valueSet)
    }

    @ReactMethod
    fun removeGlobalTargeting(key: String) {
      AudienzzTargetingParams.removeGlobalTargeting(key)
    }

    @ReactMethod
    fun clearGlobalTargeting() {
      AudienzzTargetingParams.clearGlobalTargeting()
    }

    @ReactMethod
    fun getGlobalOrtbConfig(promise: Promise) {
      promise.resolve(AudienzzTargetingParams.getGlobalOrtbConfig())
    }

    @ReactMethod
    fun setGlobalOrtbConfig(ortbConfig: String) {
      try {
        val jsonObject = JSONObject(ortbConfig)
        AudienzzTargetingParams.setGlobalOrtbConfig(jsonObject)
      } catch (e: Exception) {
        Log.e(TAG, "Invalid JSON for ORTB config: ${e.message}")
      }
    }

  companion object Companion {
    private const val SERVICE = "RNAudienzzTargetingModule"
    private const val TAG = "AudienzzTargetingModule"
  }
}
