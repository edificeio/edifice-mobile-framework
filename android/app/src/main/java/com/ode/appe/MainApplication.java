package com.ode.appe;

import android.app.Application;

import com.facebook.flipper.android.AndroidFlipperClient;
import com.facebook.flipper.android.utils.FlipperUtils;
import com.facebook.flipper.core.FlipperClient;
import com.facebook.flipper.plugins.fresco.FrescoFlipperPlugin;
import com.facebook.flipper.plugins.inspector.DescriptorMapping;
import com.facebook.flipper.plugins.inspector.InspectorFlipperPlugin;
import com.facebook.flipper.plugins.leakcanary.LeakCanaryFlipperPlugin;
import com.facebook.flipper.plugins.leakcanary.RecordLeakService;
import com.facebook.flipper.plugins.navigation.NavigationFlipperPlugin;
import com.facebook.flipper.plugins.network.FlipperOkhttpInterceptor;
import com.facebook.flipper.plugins.network.NetworkFlipperPlugin;
import com.facebook.flipper.plugins.sharedpreferences.SharedPreferencesFlipperPlugin;
import com.facebook.react.BuildConfig;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.modules.network.NetworkingModule;
import com.facebook.soloader.SoLoader;
import com.squareup.leakcanary.LeakCanary;
import com.squareup.leakcanary.RefWatcher;

import java.util.List;

import okhttp3.OkHttpClient;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return new PackageList(this).getPackages();
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
    //
    // Flipper Initialization
    // @see https://fbflipper.com/docs/getting-started/android-native/
    //
    if (BuildConfig.DEBUG && FlipperUtils.shouldEnableFlipper(this)) {
      final FlipperClient client = AndroidFlipperClient.getInstance(this);
      client.addPlugin(new FrescoFlipperPlugin());
      client.addPlugin(new InspectorFlipperPlugin(this, DescriptorMapping.withDefaults()));
      client.addPlugin(NavigationFlipperPlugin.getInstance());
      client.addPlugin(new SharedPreferencesFlipperPlugin(this, "appe"));
      // Leak Canary Specific Steps
      RefWatcher refWatcher = LeakCanary.refWatcher(this)
              .listenerServiceClass(RecordLeakService.class)
              .buildAndInstall();
      client.addPlugin(new LeakCanaryFlipperPlugin());
      // Neetwork Specific Steps
      NetworkFlipperPlugin networkFlipperPlugin = new NetworkFlipperPlugin();
      new NetworkingModule.CustomClientBuilder() {
        @Override
        public void apply(OkHttpClient.Builder builder) {
          builder.addNetworkInterceptor(new FlipperOkhttpInterceptor(networkFlipperPlugin));
        }
      };
      client.addPlugin(networkFlipperPlugin);
      // Start Flopper Client now!
      client.start();
    }
  }
}
