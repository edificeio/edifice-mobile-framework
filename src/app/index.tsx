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
import { Trackers } from '~/framework/util/tracker';
import { AllModulesBackup } from '~/infra/oauth';

import { initI18n } from './i18n';
import { IStoreProp, connectWithStore } from './store';

/**
 * Code that listen to App State changes
 */

const handleAppStateChange = (nextAppState: AppStateStatus) => {
  if (nextAppState === 'active') {
    console.debug('[App State] now in foreground');
    Trackers.trackDebugEvent('Application', 'DISPLAY');
  } else if (nextAppState === 'background') {
    console.debug('[App State] now in background mode');
  }
};

function useAppState() {
  React.useEffect(() => {
    const appStateListener = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      appStateListener.remove();
    };
  }, []);
}

/**
 * Code that listen to Locale changes
 */

function useLocale() {
  const [currentLocale, setCurrentLocale] = React.useState<ReturnType<typeof initI18n>>(initI18n());
  const handleLocaleChange = React.useCallback(() => {
    setCurrentLocale(initI18n());
  }, []);
  React.useEffect(() => {
    RNLocalize.addEventListener('change', handleLocaleChange);
    return () => {
      RNLocalize.removeEventListener('change', handleLocaleChange);
    };
  }, [handleLocaleChange]);
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
  useLocale();
  useTrackers();

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <Provider store={props.store}>
        <Navigation />
      </Provider>
    </SafeAreaProvider>
  );
}

// Hack to generate scopes without circular deps. ToDo: fix it !
AllModulesBackup.value = AppModules();

export default connectWithStore(App);
