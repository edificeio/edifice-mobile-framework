package com.ode.appe;

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
import com.facebook.flipper.plugins.sandbox.SandboxFlipperPlugin;
import com.facebook.flipper.plugins.sandbox.SandboxFlipperPluginStrategy;
import com.facebook.flipper.plugins.sharedpreferences.SharedPreferencesFlipperPlugin;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.network.NetworkingModule;
import com.squareup.leakcanary.LeakCanary;
import com.squareup.leakcanary.RefWatcher;

public class ReactNativeFlipper {

    public static void initializeFlipper(Context context, ReactInstanceManager reactInstanceManager) {

        if (FlipperUtils.shouldEnableFlipper(context)) {

            final FlipperClient client = AndroidFlipperClient.getInstance(context);

            final RefWatcher refWatcher = LeakCanary.refWatcher(context)
                    .listenerServiceClass(RecordLeakService.class)
                    .buildAndInstall();

            client.addPlugin(new SharedPreferencesFlipperPlugin(context));
            client.addPlugin(CrashReporterPlugin.getInstance());
            client.addPlugin(new DatabasesFlipperPlugin(context));
            client.addPlugin(new InspectorFlipperPlugin(context, DescriptorMapping.withDefaults()));
            client.addPlugin(new LeakCanaryFlipperPlugin());
            client.addPlugin(NavigationFlipperPlugin.getInstance());
            client.addPlugin(new ReactFlipperPlugin());
            client.addPlugin(new SharedPreferencesFlipperPlugin(context, "appe"));
            NetworkFlipperPlugin networkFlipperPlugin = new NetworkFlipperPlugin();
            NetworkingModule.setCustomClientBuilder(builder -> builder.addNetworkInterceptor(new FlipperOkhttpInterceptor(networkFlipperPlugin)));
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
