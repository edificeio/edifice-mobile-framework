package com.ode.appe;

import android.content.Context;
import com.facebook.flipper.android.AndroidFlipperClient;
import com.facebook.flipper.android.utils.FlipperUtils;
import com.facebook.flipper.core.FlipperClient;
import com.facebook.flipper.plugins.fresco.FrescoFlipperPlugin;
import com.facebook.flipper.plugins.inspector.DescriptorMapping;
import com.facebook.flipper.plugins.inspector.InspectorFlipperPlugin;
import com.facebook.flipper.plugins.network.FlipperOkhttpInterceptor;
import com.facebook.flipper.plugins.network.NetworkFlipperPlugin;
import com.facebook.flipper.plugins.sharedpreferences.SharedPreferencesFlipperPlugin;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.network.NetworkingModule;

public class ReactNativeFlipper {
    public static void initializeFlipper(Context context, ReactInstanceManager reactInstanceManager) {
        if (FlipperUtils.shouldEnableFlipper(context)) {
            try {
                // Flipper Client Initialization
                final FlipperClient client = AndroidFlipperClient.getInstance(context);
                client.addPlugin(new InspectorFlipperPlugin(context, DescriptorMapping.withDefaults()));
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
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
