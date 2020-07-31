import I18n from "i18n-js";
import { createDrawerNavigator } from "react-navigation-drawer";
import { createStackNavigator } from "react-navigation-stack";

import DrawerMenuContainer from "./containers/DrawerMenu";
import MailItem from "./containers/MailContent";
import MailList from "./containers/MailList";

// using stack navigators so that headers can be displayed

const inboxStack = createStackNavigator({ inbox: MailList });
const outboxStack = createStackNavigator({ outbox: MailList });
const draftsStack = createStackNavigator({ drafts: MailList });
const trashStack = createStackNavigator({ trash: MailList });
const spamsStack = createStackNavigator({ spams: MailList });

const DrawerNavigator = createDrawerNavigator(
  {
    inbox: {
      screen: inboxStack,
      navigationOptions: {
        drawerLabel: I18n.t("zimbra-inbox"),
      },
    },
    outbox: {
      screen: outboxStack,
      navigationOptions: {
        drawerLabel: I18n.t("zimbra-outbox"),
      },
    },
    drafts: {
      screen: draftsStack,
      navigationOptions: {
        drawerLabel: I18n.t("zimbra-drafts"),
      },
    },
    trash: {
      screen: trashStack,
      navigationOptions: {
        drawerLabel: I18n.t("zimbra-trash"),
      },
    },
    spams: {
      screen: spamsStack,
      navigationOptions: {
        drawerLabel: I18n.t("zimbra-spams"),
      },
    },
  },
  {
    initialRouteName: "inbox",
    contentComponent: DrawerMenuContainer,
  }
);

export default createStackNavigator(
  {
    drawerNavigator: {
      screen: DrawerNavigator,
    },
    mailDetail: {
      screen: MailItem,
    },
  },
  { initialRouteName: "drawerNavigator", headerMode: "none" }
);
