import * as React from "react";
import SplashScreen from "react-native-splash-screen";
import { connect } from "react-redux";

import { RootNavigationContainer } from "./navigation/RootNavigator";
import pushNotifications from "./pushNotifications";
import Tracking from "./tracking/TrackingManager";
import { Component } from "glamorous-native";

export let rootNavigatorRef = null;

export class AppScreen extends React.Component<any> {
  public navigator: any;
  public static router = RootNavigationContainer.router;

  public async componentDidMount() {
    rootNavigatorRef = this.navigator;
  }

  public setNavigator(nav: any) {
    this.navigator = nav;
  }
  public render() {
    return <RootNavigationContainer ref={nav => this.setNavigator(nav)} />;
  }
}

export default connect()(AppScreen);
