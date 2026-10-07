package com.ode.appe

import android.annotation.SuppressLint
import android.app.NotificationManager
import android.content.Intent
import android.content.pm.ActivityInfo
import android.os.Build
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.swmansion.rnscreens.fragment.restoration.RNScreensFragmentFactory
import com.zoontek.rnbootsplash.RNBootSplash

class MainActivity : ReactActivity() {
    @SuppressLint("SourceLockedOrientationActivity")
    override fun onCreate(savedInstanceState: Bundle?) {
        this.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        supportFragmentManager.fragmentFactory = RNScreensFragmentFactory()
        RNBootSplash.init(this, R.style.SplashScreenTheme)

        /**
         * React-navigation fix for native android navBar margins.
         * Default margins are too wide and mismatch the traditional native behaviour.
         * This custom theme overrides the value used by react-navigation ('contentInsetStart')
         * by a value that visually matches the native header buttons.
         * This is located to a custom style file because the regular one is overriden by the override-cli.
         * note: Must be applied after RNBootSplash.init, which resets the activity theme.
         */
        theme.applyStyle(R.style.ThemeOverlay_AppToolbar, true)

        super.onCreate(null)
    }

    override fun onResume() {
        super.onResume()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val ctx = this.applicationContext
            try {
                val notificationManager =
                    getSystemService(NOTIFICATION_SERVICE) as NotificationManager
                notificationManager?.cancelAll()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    override fun getMainComponentName(): String? {
        return "appe"
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return DefaultReactActivityDelegate(
            this,
            mainComponentName!!,
            fabricEnabled
        )
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
    }
}
