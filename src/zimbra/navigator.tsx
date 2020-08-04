import { createStackNavigator } from "react-navigation-stack";

import DrawerNavigatorWrapper from "./containers/DrawerNavigatorWrapper";
import MailItem from "./containers/MailContent";

export default createStackNavigator(
  {
    DrawerNavigator: DrawerNavigatorWrapper,
    mailDetail: MailItem,
  },
  { initialRouteName: "DrawerNavigator", headerMode: "screen" }
);
