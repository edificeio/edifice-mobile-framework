import * as React from "react";

import {RootNavigationContainer} from "./navigation/RootNavigator";
import {withLinkingAppWrapper} from "./infra/withLinkingAppWrapper";

export let rootNavigatorRef: any = null;

function _AppScreen() {
  return (
    <RootNavigationContainer ref={nav => rootNavigatorRef = nav} />
  )
}


const AppScreen = withLinkingAppWrapper(_AppScreen);

export default AppScreen;
