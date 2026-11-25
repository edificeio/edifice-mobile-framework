package com.ode.appe

import android.app.Application
import android.content.ComponentCallbacks2
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.common.assets.ReactFontManager
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter

class MainApplication : Application(), ReactApplication {

    override val reactHost: ReactHost by lazy {
        getDefaultReactHost(
            context = applicationContext,
            packageList =
                PackageList(this).packages.apply {
                    add(BuildInfoPackage())
                    add(ZendeskUnifiedPackage())
                },
        )
    }

    override fun onCreate() {
        super.onCreate()
        registerRichTextFonts()
        loadReactNative(this)
    }

    // Fonts available in the web rich text editor (Tiptap), registered under their web names
    // so that `font-family` styles in rich content resolve natively.
    private fun registerRichTextFonts() {
        val fontManager = ReactFontManager.getInstance()
        fontManager.addCustomFont(this, "Ecriture A", R.font.ecriturea)
        fontManager.addCustomFont(this, "IBM Plex Mono", R.font.ibmplexmono)
        fontManager.addCustomFont(this, "Lora", R.font.lora)
        fontManager.addCustomFont(this, "Marelle", R.font.marelle)
        fontManager.addCustomFont(this, "OpenDyslexic", R.font.opendyslexic)
    }

    override fun onTrimMemory(level: Int) {
        super.onTrimMemory(level)
        android.os.Handler(android.os.Looper.getMainLooper()).post {
            try {
                reactHost
                ?.currentReactContext
                ?.getJSModule(RCTDeviceEventEmitter::class.java)
                ?.emit("memoryWarning", null)
            } catch (e: Exception) {
                android.util.Log.e("MemoryWarning", "Error emitting memoryWarning: ${e.message}", e)
            }
        }
    }
}
