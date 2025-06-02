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

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import javax.annotation.Nonnull

open class ReactNativeModule(
  reactContext: ReactApplicationContext?,
  private val moduleName: String
) :
  ReactContextBaseJavaModule(reactContext), ContextProvider {
  val context: ReactContext
    get() = reactApplicationContext

  override val applicationContext: Context
    get() = reactApplicationContext.applicationContext

  @Nonnull
  override fun getName(): String {
    return moduleName
  }
}
