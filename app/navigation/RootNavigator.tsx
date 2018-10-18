import * as React from "react";
import { View } from "react-native";
import { createSwitchNavigator, NavigationContainer } from "react-navigation";

import LoginPage from "../user/containers/LoginPage";
import { MainNavigator } from "./MainNavigator";

export const RootNavigator: NavigationContainer = createSwitchNavigator({
  Bootstrap: () => <View />,
  Login: { screen: LoginPage },
  Main: { screen: MainNavigator }
});
