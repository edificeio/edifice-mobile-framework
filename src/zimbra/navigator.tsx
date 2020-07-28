import React from "react";
import { createDrawerNavigator } from "react-navigation-drawer";
import { createStackNavigator } from "react-navigation-stack";

import { Text } from "../ui/Typography";
import mailDetail from "./containers/MailItem";
import mailList from "./containers/MailList";
import newMail from "./containers/NewMail";
import DrawerMenu from "./containers/DrawerMenu";
import I18n from "i18n-js";

export default createDrawerNavigator(
  {
    [I18n.t("zimbra-inbox")]: { screen: mailList },
    [I18n.t("zimbra-outbox")]: { screen: mailList },
    [I18n.t("zimbra-drafts")]: { screen: mailList },
    [I18n.t("zimbra-trash")]: { screen: mailList },
    [I18n.t("zimbra-spams")]: { screen: mailList },
    //"newMail,
    //mailDetail,
  },
  {
    initialRouteName: I18n.t("zimbra-inbox"),
    contentComponent: DrawerMenu,
  }
);
