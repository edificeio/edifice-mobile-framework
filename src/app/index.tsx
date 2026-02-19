import * as React from 'react';
import { AppState, AppStateStatus, Platform, StatusBar } from 'react-native';

import PushNotificationIOS from '@react-native-community/push-notification-ios';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
import DeviceInfo from 'react-native-device-info';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import * as RNLocalize from 'react-native-localize';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import * as Redux from 'react-redux';

import { DeviceTrust } from './device-trust';
import { I18n } from './i18n';
import loadModules from './modules';
import { connectWithStore, IStoreProp, Reducers } from './store';
import theme from './theme';

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

interface AppProps extends IStoreProp {}

const useCoreDependencies = () => {
  useConstructor(async () => {
    await Storage.init();
    await I18n.init();
  });
};

function App(props: AppProps) {
  useCoreDependencies();

  useAppState();
  useTrackers();
  useNotificationEvent();

  React.useEffect(() => {
    if (Platform.OS === 'android') StatusBar.setBackgroundColor(theme.palette.primary.regular);
  }, []);

  /**
   * on Android, edge-to-edge compatibility for react-native-keyboard-controller force us to make Status bar transparent
   *  and take insets into account when needed.
   */
  const content = (
    <>
      <StatusBar translucent />
      <DeviceTrust>
        <KeyboardProvider navigationBarTranslucent>
          <GestureHandlerRootView style={UI_STYLES.flex1}>
            <SafeAreaProvider initialMetrics={initialWindowMetrics}>
              <Redux.Provider store={props.store}>
                <AppStartupHandler />
              </Redux.Provider>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </KeyboardProvider>
      </DeviceTrust>
    </>
  );
  return appConf.zendeskEnabled ? <ZendeskProvider zendeskConfig={appConf.zendesk!}>{content}</ZendeskProvider> : <>{content}</>;
}

loadModules();
Reducers.register('startup', navigationReducer);
Reducers.register('connectionTracker', connectionTrackerReducer);

export default connectWithStore(App);
