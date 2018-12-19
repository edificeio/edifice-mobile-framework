import I18n from "i18n-js";
import * as React from "react";
import RNLanguages from "react-native-languages";
import { Provider } from "react-redux";
import { applyMiddleware, combineReducers, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import AppScreen from "./AppScreen";

import Tracking from "./tracking/TrackingManager";

import connectionTracker from "./infra/reducers/connectionTracker";
import ui from "./infra/reducers/ui";
import timeline from "./timeline/reducer";

import { login, refreshToken } from "./user/actions/login";

import moduleDefinitions from "./AppModules";
import { getReducersFromModuleDefinitions } from "./infra/moduleTool";

import { AppState } from "react-native";
import firebase from "react-native-firebase";
import {
  Notification,
  NotificationOpen
} from "react-native-firebase/notifications";

const reducers = {
  connectionTracker,
  ui,
  ...getReducersFromModuleDefinitions(moduleDefinitions)
};

const rootReducer = combineReducers({
  ...reducers,
  timeline // TODO put this in module definitions
});

const enhancer = applyMiddleware(thunkMiddleware);
const store = createStore(rootReducer, enhancer);

// Translation setup
I18n.fallbacks = true;
I18n.defaultLocale = "en";
I18n.translations = {
  en: require("../assets/i18n/en"),
  es: require("../assets/i18n/es"),
  fr: require("../assets/i18n/fr")
};
// Print current device language
console.log("language", RNLanguages.language);
// Print user preferred languages (in order)
console.log("languages", RNLanguages.languages);
I18n.locale = RNLanguages.language;

export class AppStore extends React.Component {
  private notificationOpenedListener;
  private onTokenRefreshListener:

  public state = {
    appState: null
  };

  public render() {
    return (
      <Provider store={store}>
        <AppScreen />
      </Provider>
    );
  }

  public async componentWillMount() {
    await Tracking.init();
    RNLanguages.addEventListener("change", this.onLanguagesChange);
    AppState.addEventListener("change", this.handleAppStateChange);
  }

  public async componentDidMount() {
    store.dispatch(login(true) as any);
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened((notificationOpen: NotificationOpen) =>
        this.handleNotification(notificationOpen)
      );
    this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(fcmToken => {
        this.handleFCMTokenModified(fcmToken);
    });

    const notificationOpen: NotificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      this.handleNotification(notificationOpen);
    }
  }

  public componentWillUnmount() {
    RNLanguages.removeEventListener("change", this.onLanguagesChange);
    AppState.removeEventListener("change", this.handleAppStateChange);
    this.notificationOpenedListener();
    this.onTokenRefreshListener();
  }

  private onLanguagesChange = ({ language }) => {
    I18n.locale = language;
  };

  private handleAppStateChange = (nextAppState: string) => {
    this.setState({ appState: nextAppState });
    if (nextAppState === "active") {
      console.log("app is now active again !");
    }
  };

  private handleNotification = (notificationOpen: NotificationOpen) => {
    // Get the action triggered by the notification being opened
    const action = notificationOpen.action;
    // Get information about the notification that was opened
    const notification: Notification = notificationOpen.notification;
    console.log("got notification !", notification);
    Tracking.logEvent("openNotificationPush");
    const data = JSON.parse(notification.data.params);
    store.dispatch({
      notification,
      type: "NOTIFICATION_OPEN"
    });
  };

  private handleFCMTokenModified = fcmToken => {
    store.dispatch<any>(refreshToken(fcmToken));
  };
}
