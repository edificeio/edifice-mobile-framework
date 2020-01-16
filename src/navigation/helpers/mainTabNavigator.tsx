import style from "glamorous-native";
import * as React from "react";
import { NavigationState, NavigationScreenProp } from "react-navigation";
import { createBottomTabNavigator } from "react-navigation-tabs";

import { CommonStyles } from "../../styles/common/styles";
import { IconOnOff } from "../../ui";

export const createMainTabNavigator = (
  routeConfigs,
  initialRouteName: string = undefined
) =>
  createBottomTabNavigator(routeConfigs, {
    initialRouteName,
    defaultNavigationOptions: shouldTabBarBeVisible,
    swipeEnabled: false,
    tabBarOptions: {
      // Colors
      activeTintColor: CommonStyles.mainColorTheme,
      inactiveTintColor: CommonStyles.mainColorTheme,
      // Label and icon
      showIcon: true,
      showLabel: true,
      // Style
      style: {
        backgroundColor: CommonStyles.tabBottomColor,
        borderTopColor: CommonStyles.borderColorLighter,
        borderTopWidth: 1,
        elevation: 1,
        height: 56
      },
      tabStyle: {
        flexDirection: "column",
        height: "100%"
      }
    }
  });

export const createMainTabNavOption = (title: string, iconName: string) => ({
  tabBarIcon: ({ focused }) => (
    <IconOnOff name={iconName} focused={focused} style={{ marginTop: -6 }} />
  ),
  tabBarLabel: ({ focused }) => (
    <MainTabNavigationLabel focused={focused}>{title}</MainTabNavigationLabel>
  )
});

const MainTabNavigationLabel = style.text(
  {
    alignSelf: "center",
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 12,
    marginBottom: 4,
    marginTop: -12
  },
  ({ focused }) => ({
    color: focused ? CommonStyles.actionColor : CommonStyles.textTabBottomColor
  })
);

export const shouldTabBarBeVisible = ({ navigation }: { navigation: NavigationScreenProp<NavigationState> }) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible
  };
};
