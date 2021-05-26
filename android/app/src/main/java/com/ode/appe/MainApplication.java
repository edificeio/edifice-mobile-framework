package com.ode.appe;

import android.app.Application;
import android.content.Context;

import com.facebook.flipper.android.AndroidFlipperClient;
import com.facebook.flipper.android.utils.FlipperUtils;
import com.facebook.flipper.core.FlipperClient;
import com.facebook.flipper.plugins.crashreporter.CrashReporterPlugin;
import com.facebook.flipper.plugins.databases.DatabasesFlipperPlugin;
import com.facebook.flipper.plugins.fresco.FrescoFlipperPlugin;
import com.facebook.flipper.plugins.inspector.DescriptorMapping;
import com.facebook.flipper.plugins.inspector.InspectorFlipperPlugin;
import com.facebook.flipper.plugins.leakcanary.LeakCanaryFlipperPlugin;
import com.facebook.flipper.plugins.leakcanary.RecordLeakService;
import com.facebook.flipper.plugins.navigation.NavigationFlipperPlugin;
import com.facebook.flipper.plugins.network.FlipperOkhttpInterceptor;
import com.facebook.flipper.plugins.network.NetworkFlipperPlugin;
import com.facebook.flipper.plugins.react.ReactFlipperPlugin;
import com.facebook.flipper.plugins.sharedpreferences.SharedPreferencesFlipperPlugin;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.ReactContext;
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
      @SuppressWarnings("UnnecessaryLocalVariable")
      List<ReactPackage> packages = new PackageList(this).getPackages();
      packages.add(new BridgePackage());
      return packages;
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
    MainApplication.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }

  //
  // Flipper Initialization
  //
  private static void initializeFlipper(Context context, ReactInstanceManager reactInstanceManager) {
    if (BuildConfig.DEBUG && FlipperUtils.shouldEnableFlipper(context)) {
      final FlipperClient client = AndroidFlipperClient.getInstance(context);
      client.addPlugin(new InspectorFlipperPlugin(context, DescriptorMapping.withDefaults()));
      client.addPlugin(new ReactFlipperPlugin());
      client.addPlugin(new DatabasesFlipperPlugin(context));
      client.addPlugin(new SharedPreferencesFlipperPlugin(context));
      client.addPlugin(CrashReporterPlugin.getInstance());
      client.addPlugin(NavigationFlipperPlugin.getInstance());
      client.addPlugin(new LeakCanaryFlipperPlugin());
      RefWatcher refWatcher = LeakCanary.refWatcher(context)
              .listenerServiceClass(RecordLeakService.class)
              .buildAndInstall();
      NetworkFlipperPlugin networkFlipperPlugin = new NetworkFlipperPlugin();
      NetworkingModule.setCustomClientBuilder(
              new NetworkingModule.CustomClientBuilder() {
                @Override
                public void apply(OkHttpClient.Builder builder) {
                  builder.addNetworkInterceptor(new FlipperOkhttpInterceptor(networkFlipperPlugin));
                }
              });
      client.addPlugin(networkFlipperPlugin);
      client.start();
      // Fresco Plugin needs to ensure that ImagePipelineFactory is initialized
      // Hence we run if after all native modules have been initialized
      ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
      if (reactContext == null) {
        reactInstanceManager.addReactInstanceEventListener(
                new ReactInstanceManager.ReactInstanceEventListener() {
                  @Override
                  public void onReactContextInitialized(ReactContext reactContext) {
                    reactInstanceManager.removeReactInstanceEventListener(this);
                    reactContext.runOnNativeModulesQueueThread(
                            new Runnable() {
                              @Override
                              public void run() {
                                client.addPlugin(new FrescoFlipperPlugin());
                              }
                            });
                  }
                });
      } else {
        client.addPlugin(new FrescoFlipperPlugin());
      }
    }
  }

}
