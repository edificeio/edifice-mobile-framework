/**
 * App
 * Main entry point fo React code
 */

import * as React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { getInAppMessaging, setMessagesDisplaySuppressed } from '@react-native-firebase/in-app-messaging';
import DeviceInfo from 'react-native-device-info';

import { Trackers } from '~/framework/util/tracker';
import { ComposeProviders } from '~/util/compose-providers';

import { ModuleLoader } from './module/loader';
import { providers } from './providers';
import { AppStartupHandler } from './startup';

const loaderStyles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
});

export function App() {
  /**
   * @deprecated matomo is not used anymore. Plz replace this with anything when we'll switch to another data tracking tool.
   */
  React.useEffect(() => {
    Trackers.init().then(() => {
      Trackers.setCustomDimension(4, 'App Name', DeviceInfo.getApplicationName());
    });
  }, []);

  /**
   * Custom handling iOS notification badge.
   * ToDo: handle this properly ?
   */
  React.useEffect(() => {
    const type = 'notification';
    PushNotificationIOS.addEventListener(type, notification => {
      const result = PushNotificationIOS.FetchResult.NoData;
      notification.finish(result);
    });
    if (Platform.OS === 'ios')
      setMessagesDisplaySuppressed(getInAppMessaging(), true).catch(e =>
        console.warn('[InAppMessaging] Unable to change messages display suppression:', e),
      );
    return () => {
      PushNotificationIOS.removeEventListener(type);
    };
  }, []);

  return (
    <React.Suspense
      fallback={
        <View style={loaderStyles.loader}>
          <ActivityIndicator />
        </View>
      }>
      <ModuleLoader>
        <ComposeProviders providers={providers}>
          <AppStartupHandler />
        </ComposeProviders>
      </ModuleLoader>
    </React.Suspense>
  );
}
