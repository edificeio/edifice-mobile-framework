import I18n from "i18n-js";
import React from "react";
import { Platform, View } from "react-native";
import { hasNotch } from "react-native-device-info";
import { NavigationState } from "react-navigation";
import { createDrawerNavigator, NavigationDrawerProp } from "react-navigation-drawer";

import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { CommonStyles } from "../../styles/common/styles";
import { PageContainer } from "../../ui/ContainerContent";
import { Text } from "../../ui/Typography";
import { Header as HeaderComponent } from "../../ui/headers/Header";
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
    folder: MailList,
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
        header: null,
      },
      navigation
    );
  };

  getTitle = (activeRoute: any) => {
    const { key, params } = activeRoute;
    if (params !== undefined && params.folderName !== undefined) return params.folderName;
    switch (key) {
      case "outbox":
        return I18n.t("zimbra-outbox");
      case "drafts":
        return I18n.t("zimbra-drafts");
      case "trash":
        return I18n.t("zimbra-trash");
      case "spams":
        return I18n.t("zimbra-spams");
      default:
      case "inbox":
        return I18n.t("zimbra-inbox");
    }
  };

  getActiveRouteState = (route: NavigationState) => {
    if (!route.routes || route.routes.length === 0 || route.index >= route.routes.length) {
      return route;
    }

    const childActiveRoute = route.routes[route.index] as NavigationState;
    return this.getActiveRouteState(childActiveRoute);
  };

  public render() {
    const { navigation } = this.props;
    const title = this.getTitle(this.getActiveRouteState(navigation.state));

    return (
      <PageContainer>
        <HeaderComponent>
          <HeaderAction
            name="menu"
            onPress={() => {
              navigation.toggleDrawer();
            }}
          />
          <Text
            style={{
              alignSelf: "center",
              color: "white",
              fontFamily: CommonStyles.primaryFontFamily,
              fontSize: 16,
              fontWeight: "400",
              textAlign: "center",
              flex: 1,
            }}>
            {title}
          </Text>
        </HeaderComponent>
        <View
          style={{
            position: "absolute",
            right: 0,
            top: Platform.OS === "ios" ? (hasNotch() ? 0 : 4) : 2,
            zIndex: 5,
            elevation: 5,
          }}>
          <HeaderAction
            name="new_message"
            onPress={() => {
              navigation.navigate("newMail", { currentFolder: this.getActiveRouteState(navigation.state).key });
            }}
            primary
          />
        </View>
        <DrawerNavigatorComponent navigation={navigation} />
      </PageContainer>
    );
  }
}
