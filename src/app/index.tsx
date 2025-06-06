import * as React from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';

import PushNotificationIOS from '@react-native-community/push-notification-ios';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
import DeviceInfo from 'react-native-device-info';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as RNLocalize from 'react-native-localize';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { I18n } from './i18n';
import { connectWithStore, IStoreProp, Reducers } from './store';

import AppModules from '~/app/modules';
import { UI_STYLES } from '~/framework/components/constants';
import { reducer as navigationReducer } from '~/framework/navigation/redux';
import Navigation from '~/framework/navigation/RootNavigator';
import appConf from '~/framework/util/appConf';
import { AppModules as AllModulesBackup2 } from '~/framework/util/oauth2';
import { isEmpty } from '~/framework/util/object';
import { Trackers } from '~/framework/util/tracker';
import { ZendeskProvider } from '~/framework/util/zendesk';
import { AllModulesBackup } from '~/infra/oauth';
import connectionTrackerReducer from '~/infra/reducers/connectionTracker';

function useAppState() {
  const [currentLocale, setCurrentLocale] = React.useState(I18n.getLanguage());
  const currentState = React.useRef<AppStateStatus>();

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
          if (newLocale !== currentLocale) setCurrentLocale(lng);
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

interface AppProps extends IStoreProp {}

function App(props: AppProps) {
  const onRemoteNotification = notification => {
    const result = PushNotificationIOS.FetchResult.NoData;
    notification.finish(result);
  };

  useAppState();
  useTrackers();

  React.useEffect(() => {
    const type = 'notification';
    PushNotificationIOS.addEventListener(type, onRemoteNotification);
    if (Platform.OS === 'ios') inAppMessaging().setMessagesDisplaySuppressed(true).finally();
    return () => {
      PushNotificationIOS.removeEventListener(type);
    };
  }, []);

  const content = (
    <GestureHandlerRootView style={UI_STYLES.flex1}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <Provider store={props.store}>
          <Navigation />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
  return appConf.zendeskEnabled ? <ZendeskProvider zendeskConfig={appConf.zendesk!}>{content}</ZendeskProvider> : <>{content}</>;
}

// Hack to generate scopes without circular deps. ToDo: fix it !
AllModulesBackup.value = AppModules();
AllModulesBackup2.value = AppModules();

// Hack : Flatten reducers to prevent misordring of module execution
Reducers.register('startup', navigationReducer);
Reducers.register('connectionTracker', connectionTrackerReducer);

export default connectWithStore(App);
