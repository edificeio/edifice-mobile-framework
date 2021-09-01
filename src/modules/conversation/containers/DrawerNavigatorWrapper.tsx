import I18n from "i18n-js";
import React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { createDrawerNavigator, NavigationDrawerProp } from "react-navigation-drawer";

import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { CommonStyles } from "../../../styles/common/styles";
import { PageContainer } from "../../../ui/ContainerContent";
import TempFloatingAction from "../../../ui/FloatingButton/TempFloatingAction";
import { Text } from "../../../ui/Typography";
import { Header as HeaderComponent } from "../../../ui/headers/Header";
import { HeaderAction } from "../../../ui/headers/NewHeader";
import DrawerMenuContainer from "./DrawerMenu";
import MailList from "./MailList";
import { DraftType } from "./NewMail";
import moduleConfig from "../moduleConfig";

const DrawerNavigatorComponent = createDrawerNavigator(
  {
    inbox: MailList,
    sendMessages: MailList,
    drafts: MailList,
    trash: MailList,
    folder: MailList,
  },
  {
    contentComponent: DrawerMenuContainer,
    edgeWidth: -1,
  }
);

export default class DrawerNavigatorWrapper extends React.Component<{ navigation: NavigationScreenProp<NavigationState> }, any> {
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
      case "sendMessages":
        return I18n.t("conversation.outbox");
      case "drafts":
        return I18n.t("conversation.drafts");
      case "trash":
        return I18n.t("conversation.trash");
      default:
      case "inbox":
        return I18n.t("conversation.inbox");
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
            numberOfLines={1}
            style={{
              alignSelf: "center",
              paddingRight: 10,
              marginRight: 50,
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
        <DrawerNavigatorComponent navigation={navigation} />
        <TempFloatingAction
          iconName="new_message"
          onEvent={() => {
            this.props.navigation.navigate(`${moduleConfig.routeName}/new`, {
              type: DraftType.NEW,
              mailId: undefined,
              currentFolder: this.getActiveRouteState(navigation.state).key,
            });
          }}
        />
      </PageContainer>
    );
  }
}
