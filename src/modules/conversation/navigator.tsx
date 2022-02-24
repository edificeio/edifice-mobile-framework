import { createStackNavigator } from "react-navigation-stack";

import MailItem from "./containers/MailContent";
import MailList from "./containers/MailList";
import CreateMail from "./containers/NewMail";
import moduleConfig from "./moduleConfig";

export default () =>
  createStackNavigator({
    [`${moduleConfig.routeName}`]: {
      screen: MailList
    },
    [`${moduleConfig.routeName}/mail`]: {
      screen: MailItem
    },
    [`${moduleConfig.routeName}/new`]: {
      screen: CreateMail
    }
  }, {
    headerMode: "none",
  });
