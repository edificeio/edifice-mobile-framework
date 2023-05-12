/**
 * Entry point of the app
 * (formerly App.tsx)
 */
import * as React from 'react';
import { AppState, AppStateStatus } from 'react-native';
import DeviceInfo from 'react-native-device-info';
// import needed for side-effects https://docs.swmansion.com/react-native-gesture-handler/docs/installation#ios
import 'react-native-gesture-handler';
import * as RNLocalize from 'react-native-localize';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import AppModules from '~/app/modules';
import Navigation from '~/framework/navigation/RootNavigator';
import { useNavigationDevPlugins } from '~/framework/navigation/helper';
import { isEmpty } from '~/framework/util/object';
import { Trackers } from '~/framework/util/tracker';
import { AllModulesBackup } from '~/infra/oauth';

import { initI18n } from './i18n';
import { IStoreProp, connectWithStore } from './store';

const FlipperAsyncStorage = __DEV__ ? require('rn-flipper-async-storage-advanced').default : undefined;
const FlipperAsyncStorageElement = FlipperAsyncStorage ? <FlipperAsyncStorage /> : null;

/**
 * Code that listen to App State changes
 */
function useAppState() {
  const [currentLocale, setCurrentLocale] = React.useState<ReturnType<typeof initI18n>>(initI18n());
  const handleAppStateChange = React.useCallback(
    (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Track foreground state
        console.debug('[App State] now in foreground');
        Trackers.trackDebugEvent('Application', 'DISPLAY');
        // Change locale if needed
        const locales = RNLocalize.getLocales();
        const newLocale = isEmpty(locales) ? null : locales[0].languageCode;
        if (newLocale !== currentLocale) {
          setCurrentLocale(initI18n());
        }
      } else if (nextAppState === 'background') {
        // Track background state
        console.debug('[App State] now in background mode');
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
  return currentLocale;
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
  useAppState();
  useTrackers();
  useNavigationDevPlugins();
  return (
    <>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <Provider store={props.store}>
          <Navigation />
        </Provider>
      </SafeAreaProvider>
      {FlipperAsyncStorageElement}
    </>
  );
}

// Hack to generate scopes without circular deps. ToDo: fix it !
AllModulesBackup.value = AppModules();

export default connectWithStore(App);
