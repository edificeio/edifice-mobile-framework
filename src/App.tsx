// RN Imports
import * as React from 'react';
import I18n from 'i18n-js';
import { initI18n } from './framework/util/i18n';
import { Alert, AppState, AppStateStatus, StatusBar, View } from 'react-native';
import * as RNLocalize from 'react-native-localize';
import 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';

// Polyfills
import 'ts-polyfill/lib/es2019-object';

// Redux
import { Provider, connect } from 'react-redux';

// JS
import Conf from '../ode-framework-conf';

// ODE Mobile Framework Modules
import { Trackers } from './infra/tracker';

// ODE Mobile Framework Redux
import { refreshToken } from './user/actions/login';
import { loadCurrentPlatform, selectPlatform } from './user/actions/platform';
import { isInActivatingMode } from './user/selectors';
import { checkVersionThenLogin } from './user/actions/version';

// Main Screen
import AppScreen from './AppScreen';

// Style
import { CommonStyles } from './styles/common/styles';
import SplashScreen from 'react-native-splash-screen';

import messaging from '@react-native-firebase/messaging';

// Functionnal modules // THIS IS UGLY. it is a workaround for include matomo tracking.
// require("./timelinev2");
require('./mailbox');
//require("./zimbra");
//require("./pronote");
//require("./lvs");
require('./homework');
require('./workspace');
//require("./viescolaire");
require('./myAppMenu');
//require("./support");
require('./user');

// Store
import { createMainStore } from './AppStore';
import { IUserAuthState } from './user/reducers/auth';
import { IUserInfoState } from './user/state/info';

// App Conf
import './infra/appConf';
import { AppPushNotificationHandlerComponent } from './framework/util/notifications/cloudMessaging';
import { reset } from './navigation/helpers/navHelper';
import { getLoginStackToDisplay } from './navigation/LoginNavigator';
import { OAuth2RessourceOwnerPasswordClient } from './infra/oauth';

// Disable Yellow Box on release builds.
if (__DEV__) {
  // tslint:disable-next-line:no-console
  console.disableYellowBox = true;
}

class AppStoreUnconnected extends React.Component<{ store: any }, { autoLogin: boolean }> {
  private notificationOpenedListener?: () => void;
  private onTokenRefreshListener?: () => void;

  state = {
    autoLogin: false,
  };

  public render() {
    return (
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <Provider store={this.props.store}>
          <View style={{ flex: 1 }}>
            <StatusBar backgroundColor={CommonStyles.statusBarColor} barStyle="light-content" />
            <AppPushNotificationHandlerComponent>
              <AppScreen />
            </AppPushNotificationHandlerComponent>
          </View>
        </Provider>
      </SafeAreaProvider>
    );
  }

  public async componentDidMount() {
    // Event handlers
    RNLocalize.addEventListener('change', this.handleLocalizationChange);
    AppState.addEventListener('change', this.handleAppStateChange);

    // Tracking
    await Trackers.init();
    Trackers.trackEvent('Application', 'STARTUP');
    Trackers.setCustomDimension(4 /* App Name */, DeviceInfo.getBundleId());
    alert(DeviceInfo.getBundleId());
    // await Trackers.test();

    // If only one platform in conf => auto-select it.
    let platformId;
    if (Conf.platforms && Object.keys(Conf.platforms).length === 1) {
      const onboardingTexts = I18n.t('user.onboardingScreen.onboarding');
      const hasOnboardingTexts = onboardingTexts && onboardingTexts.length;
      if (hasOnboardingTexts) {
        platformId = await this.props.store.dispatch(loadCurrentPlatform());
      } else {
        platformId = Object.keys(Conf.platforms)[0];
        this.props.store.dispatch(selectPlatform(platformId));
      }
    } else {
      platformId = await this.props.store.dispatch(loadCurrentPlatform());
    }
    const connectionToken = await OAuth2RessourceOwnerPasswordClient.connection?.loadToken();
    if (platformId && connectionToken) {
      this.setState({ autoLogin: true });
    } else {
      reset(getLoginStackToDisplay(platformId));
      SplashScreen.hide();
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
    AppState.removeEventListener('change', this.handleAppStateChange);
    if (this.notificationOpenedListener) this.notificationOpenedListener();
    if (this.onTokenRefreshListener) this.onTokenRefreshListener();
  }

  private handleLocalizationChange = () => {
    initI18n();
    this.forceUpdate();
  };

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      console.log('[App State] now in active mode');
      Trackers.trackEvent('Application', 'DISPLAY');
    } else if (nextAppState === 'background') {
      console.log('[App State] now in background mode');
    }
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
const getStore = () => {
  // console.log("get the store", theStore.store);
  if (theStore.store == undefined) theStore.store = createMainStore();
  // console.log("the store is", theStore.store);
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
  } as IUserInfoState & IUserAuthState);
