package com.ode.appe;

import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends ReactActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this, R.style.SplashScreenTheme, true);
        super.onCreate(null);
    }

    @Override
    protected String getMainComponentName() {
        return "appe";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected ReactRootView createRootView() {
                ReactRootView reactRootView = new ReactRootView(getContext()); //  RNGestureHandlerEnabledRootView(MainActivity.this);
                reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
                return reactRootView;
            }
            @Override
            protected boolean isConcurrentRootEnabled() {
                return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
            }
        };
    }

    @Override
    public void onNewIntent(final Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }

}
