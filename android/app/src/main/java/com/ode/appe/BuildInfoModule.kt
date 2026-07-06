package com.ode.appe

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableNativeMap

class BuildInfoModule(
    private val context: ReactApplicationContext,
    private val buildConfig: Class<*>
) : NativeBuildInfoSpec(context) {

    override fun getName() = "BuildInfo"

    override fun fetchInfo(): WritableNativeMap {
        val map = WritableNativeMap()
        map.putString("BundleVersionType", BuildConfig.BundleVersionType)
        map.putString("BundleVersionOverride", BuildConfig.BundleVersionOverride)
        return map
    }

    companion object {
        const val NAME = "BuildInfo"
    }
}
