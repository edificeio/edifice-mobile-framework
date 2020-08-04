import I18n from "i18n-js";
import React from "react";
import { NavigationScreenProp } from "react-navigation";
import { createDrawerNavigator } from "react-navigation-drawer";

import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import DrawerMenuContainer from "./DrawerMenu";
import MailList from "./MailList";

const DrawerNavigatorComponent = createDrawerNavigator(
  {
    inbox: MailList,
    outbox: MailList,
    drafts: MailList,
    trash: MailList,
    spams: MailList,
  },
  {
    contentComponent: DrawerMenuContainer,
  }
);

export default class DrawerNavigatorWrapper extends React.Component<any, any> {
  static router = DrawerNavigatorComponent.router;
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<any> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t("zimbra-inbox"),
      },
      navigation
    );
  };
  public render() {
    const { navigation } = this.props;
    return <DrawerNavigatorComponent navigation={navigation} />;
  }
}
