import I18n from "i18n-js";
import React from "react";
import { createDrawerNavigator, NavigationDrawerProp } from "react-navigation-drawer";

import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderAction } from "../../ui/headers/NewHeader";
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
    edgeWidth: -1,
  }
);

export default class DrawerNavigatorWrapper extends React.Component<any, any> {
  static router = DrawerNavigatorComponent.router;
  static navigationOptions = ({ navigation }: { navigation: NavigationDrawerProp<any> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t("zimbra-inbox"),
        headerLeft: (
          <HeaderAction
            name="menu"
            onPress={() => {
              navigation.toggleDrawer();
            }}
          />
        ),
      },
      navigation
    );
  };
  public render() {
    const { navigation } = this.props;
    return <DrawerNavigatorComponent navigation={navigation} />;
  }
}
