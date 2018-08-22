import style from "glamorous-native";
import * as React from "react";
import {
  NavigationActions,
  TabBarBottom,
  TabNavigator
} from "react-navigation";

import { navigationRef } from "../AppScreen";
import { CommonStyles } from "../styles/common/styles";
import { IconOnOff } from "../ui";

export const tabNavigator = routes =>
  TabNavigator(routes, {
    swipeEnabled: false,
    tabBarComponent: TabBarBottom,
    tabBarOptions: {
      activeTintColor: CommonStyles.mainColorTheme,
      inactiveTintColor: CommonStyles.mainColorTheme,
      indicatorStyle: {
        backgroundColor: "#ffffff"
      },
      labelStyle: {
        color: CommonStyles.textTabBottomColor,
        fontFamily: CommonStyles.primaryFontFamily,
        fontSize: 12
      },
      showIcon: true,
      showLabel: true,
      style: {
        backgroundColor: CommonStyles.tabBottomColor,
        borderTopColor: CommonStyles.borderColorLighter,
        borderTopWidth: 1,
        elevation: 1,
        height: 56
      },
      upperCaseLabel: false
    },
    tabBarPosition: "bottom"
  });

export const NestedTabNavigator = routes =>
  TabNavigator(routes, {
    backBehavior: "none",
    swipeEnabled: true,
    tabBarOptions: {
      indicatorStyle: {
        backgroundColor: CommonStyles.selectColor
      },
      labelStyle: {
        fontSize: 13
      },
      showIcon: true,
      showLabel: false,
      style: {
        backgroundColor: CommonStyles.tabBackgroundColor
      }
    },
    tabBarPosition: "top"
  });

const TabBarLabel = style.text(
  {
    alignSelf: "center",
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 12,
    marginBottom: 4
  },
  ({ focused }) => ({
    color: focused ? CommonStyles.actionColor : CommonStyles.textTabBottomColor
  })
);

/**
 * return a navigationOptionsTitle object fill with its attributes
 * @param title      the title of the navigationOptionsTitle
 * @param iconName   the icon name
 */
export const tabRootOptions = (title, iconName) => ({
  tabBarIcon: ({ focused }) => <IconOnOff name={iconName} focused={focused} />,
  tabBarLabel: ({ focused }) => (
    <TabBarLabel focused={focused}>{title}</TabBarLabel>
  ),
  tabBarOptions: {
    labelStyle: {
      color: CommonStyles.textTabBottomColor,
      fontFamily: CommonStyles.primaryFontFamily,
      fontSize: 10
    }
  }
});

export const navOptions = (props, { state }) => {
  const { params = {} } = state;
  const { header } = params;

  return {
    header,
    headerStyle: {
      backgroundColor: CommonStyles.mainColorTheme,
      paddingHorizontal: 20
    },
    headerTintColor: "white",
    headerTitleStyle: {
      alignSelf: "center",
      color: "white",
      fontFamily: CommonStyles.primaryFontFamily,
      fontSize: 16,
      fontWeight: "400",
      textAlign: "center"
    },
    tabBarVisible: header !== null,
    ...props
  };
};

export const navigate = (route, props = {}) => {
  if (route === "Main") {
    const resetAction = NavigationActions.reset({
      actions: [
        NavigationActions.navigate({ routeName: route, params: props })
      ],
      index: 0
    });
    return navigationRef.dispatch(resetAction);
  }
  return navigationRef.dispatch(
    NavigationActions.navigate({ routeName: route, params: props })
  );
};
