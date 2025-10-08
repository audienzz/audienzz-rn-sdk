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

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import org.audienzz.mobile.AudienzzPrebidMobile
import org.audienzz.mobile.api.data.AudienzzInitializationStatus
import org.audienzz.mobile.util.PpidManager

class RNAudienzzModule(reactContext: ReactApplicationContext) :
  ReactNativeModule(reactContext, SERVICE) {
  @ReactMethod
  fun initialize(companyID: String, enablePpid: Boolean = false, promise: Promise) {
    AudienzzPrebidMobile.initializeSdk(applicationContext, companyID, enablePpid = enablePpid) { status ->
      when (status) {
        AudienzzInitializationStatus.SUCCEEDED -> {
          val result: WritableMap =
            Arguments.createMap().apply {
              putString("status", "SUCCEEDED")
              putString("description", "SDK initialized successfully!")
            }

          promise.resolve(result)
        }

        else -> {
          Log.e(TAG, "SDK initialization error: $status\n${status.description}")
        }
      }
    }
  }

  @ReactMethod
  fun isAutomaticPpidEnabled(promise: Promise) {
    promise.resolve(AudienzzPrebidMobile.ppidManager?.isAutomaticPpidEnabled() ?: false)
  }

  @ReactMethod
  fun setAutomaticPpidEnabled(isPpidEnabled: Boolean) {
    AudienzzPrebidMobile.ppidManager?.setAutomaticPpidEnabled(isPpidEnabled)
  }

  @ReactMethod
  fun getPpid(promise: Promise) {
    promise.resolve(AudienzzPrebidMobile.ppidManager?.getPpid())
  }

  @ReactMethod
  fun setSchainObject(schain: String) {
    AudienzzPrebidMobile.setSchainObject(schain)
  }

  companion object {
    private const val SERVICE = "RNAudienzzModule"
    private const val TAG = "AudienzzSDKInitializer"
  }
}
