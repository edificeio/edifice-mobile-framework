import I18n from "i18n-js";
import { createDrawerNavigator } from "react-navigation-drawer";

import DrawerMenuContainer from "./containers/DrawerMenu";
import mailList from "./containers/MailList";

export default createDrawerNavigator(
  {
    [I18n.t("zimbra-inbox")]: { screen: mailList },
    [I18n.t("zimbra-outbox")]: { screen: mailList },
    [I18n.t("zimbra-drafts")]: { screen: mailList },
    [I18n.t("zimbra-trash")]: { screen: mailList },
    [I18n.t("zimbra-spams")]: { screen: mailList },
  },
  {
    initialRouteName: I18n.t("zimbra-inbox"),
    contentComponent: DrawerMenuContainer,
  }
);
