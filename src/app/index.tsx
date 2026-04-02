import * as React from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';

import FastImage from '@d11/react-native-fast-image';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
import DeviceInfo from 'react-native-device-info';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as RNLocalize from 'react-native-localize';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import * as Redux from 'react-redux';
import { Action, Store } from 'redux';

import { DeviceTrust } from './device-trust';
import { I18n } from './i18n';
import { Module } from './module';
import loadOldModules from './modules';
import configureStore, { Reducers } from './store';

import { AppStartupHandler } from '~/app/startup';
import { UI_STYLES } from '~/framework/components/constants';
import { useConstructor } from '~/framework/hooks/constructor';
import { reducer as navigationReducer } from '~/framework/navigation/redux';
import appConf from '~/framework/util/appConf';
import { isEmpty } from '~/framework/util/object';
import { Storage } from '~/framework/util/storage';
import { Trackers } from '~/framework/util/tracker';
import { ZendeskProvider } from '~/framework/util/zendesk';
import connectionTrackerReducer from '~/infra/reducers/connectionTracker';

function useAppState() {
  const [currentLocale, setCurrentLocale] = React.useState(I18n.getLanguage());
  const currentState = React.useRef<AppStateStatus>(AppState.currentState);

  const handleAppStateChange = React.useCallback(
    (nextAppState: AppStateStatus) => {
      currentState.current = nextAppState;
      if (nextAppState === 'active') {
        // Track foreground state
        Trackers.trackDebugEvent('Application', 'DISPLAY');
        // Change locale if needed
        const locales = RNLocalize.getLocales();
        const newLocale = isEmpty(locales) ? null : locales[0].languageCode;
        I18n.setLanguage().then(lng => {
          if (newLocale !== currentLocale) setCurrentLocale(lng as I18n.SupportedLocales);
        });
      }
    },
    [currentLocale],
  );

  React.useEffect(() => {
    const appStateListener = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      appStateListener.remove();
    };
  }, [handleAppStateChange]);

  const handleMemoryWarning = React.useCallback(() => {
    FastImage.clearMemoryCache();
    // TODO: Clear heavy reducers?
    // TODO: Clear MMKV Heavy keys?
    // TODO: Clear APIs responses?
    Trackers.trackDebugEvent('Application', 'MEMORY WARNING TRIGGERED');
  }, []);

  React.useEffect(() => {
    const memoryListener = AppState.addEventListener('memoryWarning', () => {
      handleMemoryWarning();
    });
    return () => memoryListener.remove();
  }, []);

  return currentState;
}

function useTrackers() {
  React.useEffect(() => {
    Trackers.init().then(() => {
      Trackers.trackDebugEvent('Application', '');
      Trackers.setCustomDimension(4, 'App Name', DeviceInfo.getApplicationName());
    });
  }, []);
}

function useNotificationEvent() {
  React.useEffect(() => {
    const type = 'notification';
    PushNotificationIOS.addEventListener(type, notification => {
      const result = PushNotificationIOS.FetchResult.NoData;
      notification.finish(result);
    });
    if (Platform.OS === 'ios') inAppMessaging().setMessagesDisplaySuppressed(true).finally();
    return () => {
      PushNotificationIOS.removeEventListener(type);
    };
  }, []);
}

const useCoreDependencies = () => {
  useConstructor(async () => {
    await Storage.init();
    await I18n.init();
  });
};

const modulesPromises = Module.loadModules();

function App() {
  useCoreDependencies();
  React.use(modulesPromises);
  const [store, setStore] = React.useState<Store<unknown, Action<string>, unknown> | null>(null);
  if (!store) setStore(configureStore());

  useAppState();
  useTrackers();
  useNotificationEvent();

  if (!store) return null;

  const content = (
    <DeviceTrust>
      <GestureHandlerRootView style={UI_STYLES.flex1}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <Redux.Provider store={store}>
            <AppStartupHandler />
          </Redux.Provider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </DeviceTrust>
  );
  return appConf.zendeskEnabled ? <ZendeskProvider zendeskConfig={appConf.zendesk!}>{content}</ZendeskProvider> : <>{content}</>;
}

Reducers.register('startup', navigationReducer);
Reducers.register('connectionTracker', connectionTrackerReducer);
loadOldModules();

export default App;
