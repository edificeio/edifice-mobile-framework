import * as React from "react";
import { StatusBar, View } from "react-native";
import firebase from "react-native-firebase";
import SplashScreen from "react-native-smart-splash-screen";
import { connect } from "react-redux";

import { RootNavigator } from "./navigation/RootNavigator";
import pushNotifications from "./pushNotifications";
import { CommonStyles } from "./styles/common/styles";
import { Tracking } from "./tracking/TrackingManager";

export let navigationRef = null;

export class AppScreen extends React.Component<any, undefined> {
  public navigator: any;
  public notificationDisplayedListener;
  public static router = RootNavigator.router;

  public async componentDidMount() {
    navigationRef = this.navigator;
    SplashScreen.close({
      animationType: SplashScreen.animationType.scale,
      delay: 500,
      duration: 850
    });

    (firebase.messaging() as any).requestPermission();

    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      // await this.props.readCurrentUser(); // TODO : check this : No more needed ?
      const action = notificationOpen.action;
      const notification = notificationOpen.notification;
      this.props.handleNotifications(JSON.parse(notification.data.params));
      Tracking.logEvent("openNotificationPush");
    }
  }

  public setNavigator(nav) {
    this.navigator = nav;
  }
  public render() {
    return (
      <RootNavigator
        onNavigationStateChange={(prevState, currentState, action) => {
          // Track if tab has changed
          if (action.type !== "Navigation/NAVIGATE") return;
          const mainRouteNavPrevState = prevState.routes
            ? prevState.routes[0]
            : undefined;
          const prevTabRouteIndex = mainRouteNavPrevState
            ? mainRouteNavPrevState.index
            : undefined;

          const mainRouteNavState = currentState.routes
            ? currentState.routes[0]
            : undefined;
          const currentTabRouteIndex = mainRouteNavState
            ? mainRouteNavState.index
            : undefined;
          // continue to tracking only if current tab has changed.
          if (prevTabRouteIndex === currentTabRouteIndex) return;
          const currentTabRouteName = mainRouteNavState
            ? mainRouteNavState.routeName
            : undefined;
          if (currentTabRouteName)
            Tracking.logEvent("menuTab", {
              tab: currentTabRouteName
            });
        }}
        ref={nav => this.setNavigator(nav)}
      />
    );
  }
}

export default connect(
  state => ({}),
  dispatch => ({
    handleNotifications: data => pushNotifications(dispatch)(data)
    // readCurrentUser: notifData => readCurrentUser(dispatch)()
  })
)(AppScreen);
