import style from "glamorous-native";
import * as React from "react";
import { NavigationActions } from "react-navigation";

import { navigationRef } from "../AppScreen";
import { CommonStyles } from "../styles/common/styles";

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
  return navigationRef.dispatch(
    NavigationActions.navigate({ routeName: route, params: props })
  );
};
