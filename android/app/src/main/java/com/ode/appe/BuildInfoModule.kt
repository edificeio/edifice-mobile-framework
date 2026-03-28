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
        fun getStringField(name: String): String = try {
            buildConfig.getField(name).get(null) as? String ?: ""
        } catch (e: Exception) {
            ""
        }
        map.putString("BundleVersionType", getStringField("BundleVersionType"))
        map.putString("BundleVersionOverride", getStringField("BundleVersionOverride"))
        map.putString("CFBundleIdentifier", getStringField("CFBundleIdentifier"))
        return map
    }

    companion object {
        const val NAME = "BuildInfo"
    }
}
