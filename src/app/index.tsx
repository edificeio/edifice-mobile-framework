/**
 * Entry point of the app
 * (formerly App.tsx)
 */
import * as React from 'react';
import { AppState, AppStateStatus } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as RNLocalize from 'react-native-localize';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import AppModules from '~/app/modules';
import { UI_STYLES } from '~/framework/components/constants';
import Navigation from '~/framework/navigation/RootNavigator';
import { useNavigationDevPlugins } from '~/framework/navigation/helper';
import { isEmpty } from '~/framework/util/object';
import { Trackers } from '~/framework/util/tracker';
import { AllModulesBackup } from '~/infra/oauth';

import { I18n } from './i18n';
import { IStoreProp, connectWithStore } from './store';

const FlipperAsyncStorage = __DEV__ ? require('rn-flipper-async-storage-advanced').default : undefined;
const FlipperAsyncStorageElement = FlipperAsyncStorage ? <FlipperAsyncStorage /> : null;

/**
 * Code that listens to App State changes
 */
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
        if (newLocale !== currentLocale) setCurrentLocale(I18n.setLanguage());
      } else if (nextAppState === 'background') {
        // Track background state
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
  useAppState();
  useTrackers();
  useNavigationDevPlugins();
  return (
    <GestureHandlerRootView style={UI_STYLES.flex1}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <Provider store={props.store}>
          <Navigation />
        </Provider>
      </SafeAreaProvider>
      {FlipperAsyncStorageElement}
    </GestureHandlerRootView>
  );
}

// Hack to generate scopes without circular deps. ToDo: fix it !
AllModulesBackup.value = AppModules();

export default connectWithStore(App);
