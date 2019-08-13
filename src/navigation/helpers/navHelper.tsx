import * as React from "react";
import { NavigationActions } from "react-navigation";

import { rootNavigatorRef } from "../../AppScreen";
import { CommonStyles } from "../../styles/common/styles";
import { CurrentMainNavigationContainerComponent } from "../RootNavigator";
import { Back } from "../../ui/headers/Back";

export const standardNavScreenOptions = (props, { state }) => {
  const { params = {} } = state;
  const { header } = params;

  return {
    header,
    headerStyle: {
      backgroundColor: CommonStyles.mainColorTheme,
      elevation: 5,
      height: 56
    },
    headerTintColor: "white",
    headerTitleStyle: {
      alignSelf: "center",
      color: "white",
      fontFamily: CommonStyles.primaryFontFamily,
      fontSize: 16,
      fontWeight: "400",
      textAlign: "center",
      flex: 1
    },
    tabBarVisible: header !== null,
    headerBackTitle: null,
    ...props
  };
};

/**
 * Use the Root Navigator to go on another page.
 * CAUTION : Do NOT use this if you want navigate inside a module, instead, use the navigation prop.
 * @param route route to go
 * @param params additional parameters ot pass to navigation state
 */
export const navigate = (route, params = {}) => {
  // console.log("ROOT navigate", route);
  return rootNavigatorRef.dispatch(
    NavigationActions.navigate({ routeName: route, params })
  );
};

/**
 * Use the Root Navigator to go on another page.
 * CAUTION : Do NOT use this if you want navigate inside a module, instead, use the navigation prop.
 * @param route route to go
 * @param params additional parameters ot pass to navigation state
 */
export const nainNavNavigate = (route, params = {}) => {
  // console.log("nainNavNavigate", route);
  return CurrentMainNavigationContainerComponent.dispatch(
    NavigationActions.navigate({ routeName: route, params })
  );
};
