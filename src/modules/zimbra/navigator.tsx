import { createStackNavigator } from "react-navigation-stack";

import DrawerNavigatorWrapper from "./containers/DrawerNavigatorWrapper";
import MailItem from "./containers/MailContent";
import CreateMail from "./containers/NewMail";

export default () =>
  createStackNavigator(
    {
      DrawerNavigator: DrawerNavigatorWrapper,
      mailDetail: MailItem,
      newMail: CreateMail,
    },
    { initialRouteName: "DrawerNavigator", headerMode: "screen" }
  );
