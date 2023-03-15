import messaging from '@react-native-firebase/messaging';
import I18n from 'i18n-js';
import * as React from 'react';
import { AppState, AppStateStatus, EventSubscription, Platform, StatusBar, UIManager, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import 'react-native-gesture-handler';
// import needed for side-effects https://docs.swmansion.com/react-native-gesture-handler/docs/installation#ios
import * as RNLocalize from 'react-native-localize';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Provider, connect } from 'react-redux';
import 'ts-polyfill/lib/es2019-object';

import AppScreen from './AppScreen';
import { createMainStore } from './AppStore';
import { initI18n } from './app/i18n';
import AppModules from './app/modules';
import theme from './app/theme';
import { UI_STYLES } from './framework/components/constants';
import AppConf from './framework/util/appConf';
import { Trackers } from './framework/util/tracker';
import { AllModulesBackup, OAuth2RessourceOwnerPasswordClient } from './infra/oauth';
import { getLoginStackToDisplay } from './navigation/helpers/loginRouteName';
import { reset } from './navigation/helpers/navHelper';
import { refreshToken } from './user/actions/login';
import { loadCurrentPlatform, selectPlatform } from './user/actions/platform';
import { checkVersionThenLogin } from './user/actions/version';
import { IUserAuthState } from './user/reducers/auth';
import { isInActivatingMode } from './user/selectors';
import { IUserInfoState } from './user/state/info';

require('~/framework/modules/homework');
require('./user');

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

class AppStoreUnconnected extends React.Component<{ store: any }, { autoLogin: boolean }> {
  private appStateSubscription?: EventSubscription;

  private notificationOpenedListener?: () => void;

  private onTokenRefreshListener?: () => void;

  state = {
    autoLogin: false,
  };

  public render() {
    return (
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <Provider store={this.props.store}>
          <View style={UI_STYLES.flex1}>
            <StatusBar backgroundColor={theme.palette.primary.regular} barStyle="light-content" />
            <AppScreen />
          </View>
        </Provider>
      </SafeAreaProvider>
    );
  }

  public async componentDidMount() {
    // Event handlers
    RNLocalize.addEventListener('change', this.handleLocalizationChange);
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange) as EventSubscription;

    // Tracking
    await Trackers.init();
    Trackers.trackDebugEvent('Application', '');
    Trackers.setCustomDimension(4, 'App Name', DeviceInfo.getApplicationName());

    // If only one platform in conf => auto-select it.
    let platformId: string | null = null;
    if (AppConf?.platforms?.length === 1) {
      const onboardingTexts = I18n.t('user.onboardingScreen.onboarding');
      const hasOnboardingTexts = onboardingTexts && onboardingTexts.length;
      if (hasOnboardingTexts) {
        try {
          platformId = await this.props.store.dispatch(loadCurrentPlatform());
        } catch {
          // TODO: Manage error
        }
      } else {
        platformId = AppConf.platforms[0].name;
        this.props.store.dispatch(selectPlatform(platformId));
      }
    } else {
      try {
        platformId = await this.props.store.dispatch(loadCurrentPlatform());
      } catch {
        // TODO: Manage error
      }
    }
    const connectionToken = await OAuth2RessourceOwnerPasswordClient.connection?.loadToken();
    if (platformId && connectionToken) {
      this.setState({ autoLogin: true });
    } else {
      reset(getLoginStackToDisplay(platformId));
    }
    this.handleAppStateChange('active'); // Call this manually after Tracker is set up
  }

  public async componentDidUpdate(prevProps: any, prevState: any) {
    if (!this.onTokenRefreshListener)
      this.onTokenRefreshListener = messaging().onTokenRefresh(fcmToken => {
        this.handleFCMTokenModified(fcmToken);
      });
    if (this.state.autoLogin && !prevState.autoLogin) {
      await this.startupLogin();
    }
  }

  private async startupLogin() {
    //IF WE ARE NOT IN ACTIVATION MODE => TRY TO LOGIN => ELSE STAY ON ACTIVATION PAGE
    if (!isInActivatingMode(this.props.store.getState())) {
      // Auto Login if possible
      this.props.store.dispatch(checkVersionThenLogin(true));
    }
  }

  public componentWillUnmount() {
    RNLocalize.removeEventListener('change', this.handleLocalizationChange);
    if (this.appStateSubscription) this.appStateSubscription.remove();
    if (this.notificationOpenedListener) this.notificationOpenedListener();
    if (this.onTokenRefreshListener) this.onTokenRefreshListener();
  }

  private handleLocalizationChange = () => {
    initI18n();
    this.forceUpdate();
  };

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      Trackers.trackDebugEvent('Application', 'DISPLAY');
    } /*else if (nextAppState === 'background') {
      console.debug('[App State] now in background mode');
    }*/
  };

  private handleFCMTokenModified = (fcmToken: any) => {
    this.props.store.dispatch(refreshToken(fcmToken));
  };
}

function connectWithStore(store: any, WrappedComponent: any, ...args: [any?, any?, any?, any?]) {
  const ConnectedWrappedComponent = connect(...args)(WrappedComponent);
  return (props: any) => {
    return <ConnectedWrappedComponent {...props} store={store} />;
  };
}

const theStore: any = { store: undefined };
export const getStore = () => {
  if (!theStore.store) theStore.store = createMainStore();
  return theStore.store;
};

const mapStateToProps = (state: any) => ({
  store: getStore(),
});

export const AppStore = () => {
  return connectWithStore(getStore(), AppStoreUnconnected, mapStateToProps);
};

export default AppStore();

export const getSessionInfo = () =>
  ({
    ...(getStore().getState() as any).user.info,
    ...(getStore().getState() as any).user.auth,
  } as IUserInfoState & IUserAuthState);

AllModulesBackup.value = AppModules();
