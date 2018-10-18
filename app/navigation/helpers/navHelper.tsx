import { NavigationActions } from "react-navigation";

import { rootNavigatorRef } from "../../AppScreen";
import { CommonStyles } from "../../styles/common/styles";

export const navScreenOptions = (props, { state }) => {
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
  return rootNavigatorRef.dispatch(
    NavigationActions.navigate({ routeName: route, params: props })
  );
};
