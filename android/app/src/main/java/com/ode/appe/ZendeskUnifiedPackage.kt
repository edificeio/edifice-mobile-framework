package com.ode.appe

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class ZendeskUnifiedPackage : TurboReactPackage() {

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == ZendeskUnifiedModule.NAME) ZendeskUnifiedModule(reactContext) else null

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
      ZendeskUnifiedModule.NAME to ReactModuleInfo(
        ZendeskUnifiedModule.NAME, // name
        ZendeskUnifiedModule.NAME, // className
        false,                     // canOverrideExistingModule
        false,                     // needsEagerInit
        false,                     // isCxxModule
        true                       // isTurboModule
      )
    )
  }

  override fun createViewManagers(reactContext: ReactApplicationContext) =
    emptyList<ViewManager<*, *>>()
}
