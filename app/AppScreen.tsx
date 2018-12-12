import * as React from "react";
import { StatusBar, View } from "react-native";
import firebase from "react-native-firebase";
import SplashScreen from "react-native-smart-splash-screen";
import { connect } from "react-redux";

import { RootNavigator } from "./navigation/RootNavigator";
import pushNotifications from "./pushNotifications";
import Tracking from "./tracking/TrackingManager";

export let rootNavigatorRef = null;

export class AppScreen extends React.Component<any, undefined> {
  public navigator: any;
  public notificationDisplayedListener;
  public static router = RootNavigator.router;

  public async componentDidMount() {
    rootNavigatorRef = this.navigator;
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
    return <RootNavigator ref={nav => this.setNavigator(nav)} />;
  }
}

export default connect(
  state => ({}),
  dispatch => ({
    handleNotifications: data => pushNotifications(dispatch)(data)
    // readCurrentUser: notifData => readCurrentUser(dispatch)()
  })
)(AppScreen);
