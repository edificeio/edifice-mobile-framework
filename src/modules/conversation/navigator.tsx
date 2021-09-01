import { createStackNavigator } from "react-navigation-stack";
import { addViewTrackingToStackRoutes } from "../../framework/util/tracker/withViewTracking";

import DrawerNavigatorWrapper from "./containers/DrawerNavigatorWrapper";
import MailItem from "./containers/MailContent";
import CreateMail from "./containers/NewMail";
import moduleConfig from "./moduleConfig";

export default () =>
  createStackNavigator({
    ...addViewTrackingToStackRoutes({
      [`${moduleConfig.routeName}`]: {
          screen: DrawerNavigatorWrapper
        },
        [`${moduleConfig.routeName}/mail`]: {
          screen: MailItem
        },
        [`${moduleConfig.routeName}/new`]: {
          screen: CreateMail
        }
    })
  }, {
    initialRouteName: `${moduleConfig.routeName}`,
    headerMode: "screen"
  });
