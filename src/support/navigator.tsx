import I18n from "i18n-js";
import { createStackNavigator } from "react-navigation-stack";

import Support from "./containers/Support";

export default createStackNavigator(
  {
    screen: Support,
  },
  {
    initialRouteParams: {
      filter: "root",
      parentId: "root",
      title: I18n.t("support"),
    },
    headerMode: "none",
  }
);
