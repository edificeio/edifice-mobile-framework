package com.ode.appe;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.microsoft.appcenter.reactnative.crashes.AppCenterReactNativeCrashesPackage;
import com.microsoft.appcenter.reactnative.analytics.AppCenterReactNativeAnalyticsPackage;
import com.microsoft.appcenter.reactnative.appcenter.AppCenterReactNativePackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.kevinejohn.RNMixpanel.RNMixpanel;
import com.reactcommunity.rnlanguages.RNLanguagesPackage;
import com.github.xfumihiro.react_native_image_to_base64.ImageToBase64Package;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.imagepicker.ImagePickerPackage;
import com.entria.views.RNViewOverflowPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactnativecomponent.splashscreen.RCTSplashScreenPackage;
import com.rnfs.RNFSPackage;

import java.util.Arrays;
import java.util.List;

import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage;
import io.invertase.firebase.fabric.crashlytics.RNFirebaseCrashlyticsPackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.invertase.firebase.perf.RNFirebasePerformancePackage;

import com.kevinejohn.RNMixpanel.*;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new AppCenterReactNativeCrashesPackage(MainApplication.this, getResources().getString(R.string.appCenterCrashes_whenToSendCrashes)),
            new AppCenterReactNativeAnalyticsPackage(MainApplication.this, getResources().getString(R.string.appCenterAnalytics_whenToEnableAnalytics)),
            new AppCenterReactNativePackage(MainApplication.this),
            new FastImageViewPackage(),
            new RNMixpanel(),
            new RNLanguagesPackage(),
            new RNViewOverflowPackage(),
            new ImagePickerPackage(),
            new RCTSplashScreenPackage(),
            new RNFetchBlobPackage(),
            new ImageToBase64Package(),
            new RNFSPackage(),
            new VectorIconsPackage(),
            new RNFirebasePackage(),
            new RNFirebaseAnalyticsPackage(),
            new RNFirebaseCrashlyticsPackage(),
            new RNFirebasePerformancePackage(),
            new RNFirebaseNotificationsPackage(),
            new RNFirebaseMessagingPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
