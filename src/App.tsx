// RN Imports
import * as React from "react";
import { StatusBar, View, AppState, Linking } from "react-native";
import * as RNLocalize from "react-native-localize";
import RNFileShareIntent from 'react-native-file-share-intent';



// Redux
import { Provider, connect } from "react-redux";

// Firebase
import firebase from "react-native-firebase";
import {
  Notification,
  NotificationOpen
} from "react-native-firebase/notifications";

// JS
import Conf from "../ode-framework-conf";

// ODE Mobile Framework Modules
import Tracking from "./tracking/TrackingManager";

// ODE Mobile Framework Redux
import { refreshToken } from "./user/actions/login";
import { loadCurrentPlatform, selectPlatform } from "./user/actions/platform";
import { isInActivatingMode } from "./user/selectors";
import { checkVersionThenLogin } from "./user/actions/version";

// Store
import { store } from "./AppStore";

// Main Screen
import AppScreen from "./AppScreen";

// Style
import { CommonStyles } from './styles/common/styles';
import SplashScreen from "react-native-splash-screen";
import { initI18n } from "./infra/i18n";
import {nainNavNavigate} from "./navigation/helpers/navHelper";
import {FilterId} from "./workspace/types/filters";
import I18n from "i18n-js";
import {ContentUri} from "./workspace/types";

// Disable Yellow Box on release builds.
if (!__DEV__) {
  // tslint:disable-next-line:no-console
  console.disableYellowBox = true;
}

// Translation setup
initI18n();

class AppStoreUnconnected extends React.Component<
  { currentPlatformId: string; store: any },
  {}
> {
  private notificationOpenedListener?: () => void;
  private onTokenRefreshListener?: () => void;
  private contentUri: ContentUri | null = null;

  public state = {
    appState: null
  };

  public render() {
    return (
      <Provider store={this.props.store}>
        <View style={{ flex: 1 }}>
          <StatusBar
            backgroundColor={CommonStyles.statusBarColor}
            barStyle="light-content"
          />
          <AppScreen />
        </View>
      </Provider>
    );
  }

  public async componentWillMount() {
    // console.log("APP will mount");
    await Tracking.init();
    RNLocalize.addEventListener("change", this.handleLocalizationChange);
    AppState.addEventListener("change", this.handleAppStateChange);
  }

  public async componentDidMount() {
    // console.log("APP did mount");
    if (!this.props.currentPlatformId) {
      // If only one platform in conf => auto-select it.
      if (Conf.platforms && Object.keys(Conf.platforms).length === 1) {
        await this.props.store.dispatch(selectPlatform(Object.keys(Conf.platforms)[0]));
        await this.startupLogin();
      } else {
        // console.log("awaiting get platform id");
        const loadedPlatformId = await this.props.store.dispatch(loadCurrentPlatform());
        if (loadedPlatformId) await this.startupLogin();
      }
    }
    if (this.props.currentPlatformId) {
      await this.startupLogin();
    }
    this._checkContentUri();
    SplashScreen.hide();
  }

  public async componentDidUpdate(prevProps: any) {
    const loggedIn = (this.props as any).loggedIn

    if (loggedIn && loggedIn !== prevProps.loggedIn) {
      // push notif subscription
      if (!AppStoreUnconnected.initialNotifRouted) {
        const notificationOpen: NotificationOpen = await firebase
          .notifications()
          .getInitialNotification();
        if (notificationOpen) {
          // console.log("on notif (LAUNCH):", notificationOpen);
          this.handleNotification(notificationOpen);
        }
      }

      //TODO unsubscribe on unmount=>leak
      if (!this.notificationOpenedListener)
        this.notificationOpenedListener = firebase
          .notifications()
          .onNotificationOpened((notificationOpen: NotificationOpen) => {
            // console.log("on notif (REBACK):", notificationOpen);
            AppStoreUnconnected.initialNotifRouted = true;
            return this.handleNotification(notificationOpen);
          });

      AppStoreUnconnected.initialNotifRouted = false;

      if (!this.onTokenRefreshListener)
        this.onTokenRefreshListener = firebase
          .messaging()
          .onTokenRefresh(fcmToken => {
            this.handleFCMTokenModified(fcmToken);
          });
    }

    if (loggedIn) {
      this._handleContentUri()
    }
  }

  private async startupLogin() {
    // console.log("startup login");
    //IF WE ARE NOT IN ACTIVATION MODE => TRY TO LOGIN => ELSE STAY ON ACTIVATION PAGE
    if (!isInActivatingMode(this.props.store.getState())) {
      // Auto Login if possible
      this.props.store.dispatch(checkVersionThenLogin(true));
    }
  }

  public componentWillUnmount() {
    RNLocalize.removeEventListener("change", this.handleLocalizationChange);
    AppState.removeEventListener("change", this.handleAppStateChange);
    if (this.notificationOpenedListener) this.notificationOpenedListener();
    if (this.onTokenRefreshListener) this.onTokenRefreshListener();
  }

  private handleLocalizationChange = () => {
    initI18n()
    this.forceUpdate();
  };

  private handleAppStateChange = (nextAppState: string) => {
    if (this.state.appState === "background" && nextAppState === 'active') {
      this._checkContentUri()
    }
    else if (this.state.appState === "active" && nextAppState === 'background')
      this._clearContentUri();
    this.setState({ appState: nextAppState });
  };

  private _checkContentUri = async () => {
    const url = await this._getInitialUrl();
    RNFileShareIntent && RNFileShareIntent.getFilePath((contentUri: ContentUri) => {
      if (contentUri) {
        this.contentUri = contentUri;
      }
    });
  }

  _getInitialUrl = async () => {
    const url = await Linking.getInitialURL()
    return url
  }

  _clearContentUri = () => {
    this.contentUri = null;
  }

  /**
   * process content uri
   * @return processed a contentUri or no
   */
  _handleContentUri = (): boolean => {
    const contentUri = this.contentUri

    if (contentUri) {
      this._clearContentUri();
      nainNavNavigate(
        "Workspace",
        {
          contentUri: null,
          filter: FilterId.root,
          parentId: FilterId.root,
          title: I18n.t('workspace'),
          childRoute: "Workspace",
          childParams: {
            parentId: "owner",
            filter: FilterId.owner,
            title: I18n.t('owner'),
            contentUri
          }
        })
    }
    return contentUri != null;
  }

  private static initialNotifRouted: boolean = false;

  private handleNotification = (notificationOpen: NotificationOpen) => {
    // AppStoreUnconnected.initialNotifRouted = true;
    // console.log("got notification !");
    // Get the action triggered by the notification being opened
    const action = notificationOpen.action;
    // Get information about the notification that was opened
    const notification: Notification = notificationOpen.notification;
    // console.log("got notification !!", notification);
    Tracking.logEvent("openNotificationPush");
    this.props.store.dispatch({
      notification,
      type: "NOTIFICATION_OPEN"
    });
    SplashScreen.hide();
  };

  private handleFCMTokenModified = (fcmToken: any) => {
    this.props.store.dispatch(refreshToken(fcmToken));
  };
}

function connectWithStore(store: any, WrappedComponent:any , ...args: [any?, any?, any?, any?]) {
  const ConnectedWrappedComponent = connect(...args)(WrappedComponent);
  return (props: any) => {
    return <ConnectedWrappedComponent {...props} store={store} />;
  };
}

const mapStateToProps = (state: any, props: any) => ({
  currentPlatformId: state.user.auth.platformId,
  loggedIn: state.user.auth.loggedIn,
  store
});

export const AppStore = connectWithStore(
  store,
  AppStoreUnconnected,
  mapStateToProps
);

export default AppStore;
