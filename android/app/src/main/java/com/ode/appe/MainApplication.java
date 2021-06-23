package com.ode.appe;

import android.app.Application;
import android.content.Context;
import android.content.pm.ApplicationInfo;

import com.facebook.react.BuildConfig;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

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

  private void initializeFlipper(MainApplication application, ReactInstanceManager reactInstanceManager) {
    String flipperClass = "com.ode.appe.ReactNativeFlipper";
    if ((flipperClass != null) && (0 != (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE))) {
      try {
        Class.forName(flipperClass)
                .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
                .invoke(null, application, reactInstanceManager);
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    this.initializeFlipper(this,getReactNativeHost().getReactInstanceManager());
  }

}
