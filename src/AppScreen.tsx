import * as React from "react";
import { connect } from "react-redux";

import {CurrentMainNavigationContainerComponent, RootNavigationContainer} from "./navigation/RootNavigator";
import withLinkingAppWrapper from "./infra/withLinkingAppWrapper";

export let rootNavigatorRef = null;

class _AppScreen extends React.Component<any> {
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

const mapStateToProps = (state: any, props: any) => ({
  loggedIn: state.user.auth.loggedIn,
  CurrentMainNavigationContainerComponent,
});

const AppScreen = connect(mapStateToProps)(withLinkingAppWrapper(_AppScreen));

export default AppScreen;
