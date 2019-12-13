import * as React from "react";
import { createStackNavigator, NavigationScreenProp } from "react-navigation";
import I18n from "i18n-js";

import { IAppModule } from "../infra/moduleTool";
import { getRoutes, getModules } from "../navigation/helpers/navBuilder";
import { standardNavScreenOptions, alternativeNavScreenOptions } from "../navigation/helpers/navScreenOptions";
import { HeaderAction, HeaderBackAction } from "../ui/headers/NewHeader";
import MyAppGrid from "./components/MyAppGrid";
import NotificationListPage from "./containers/NotificationListPage";

const MyAppGridContainer = (modules: IAppModule[]) => createStackNavigator({
  myAppsGrid: {
    screen: (props: any) => <MyAppGrid {...props} modules={modules} />,
    navigationOptions: ({ navigation }: { navigation: NavigationScreenProp<{}> }) =>
      standardNavScreenOptions(
        {
          title: I18n.t("MyApplications"),
          headerRight: <HeaderAction
            onPress={() => { navigation.navigate('notifications') }}
            name="icon-notif-on"
            iconSize={24}
          />,
          headerLeftContainerStyle: {
            alignItems: "flex-start"
          },
          headerRightContainerStyle: {
            alignItems: "flex-start"
          },
          headerTitleContainerStyle: {
            alignItems: "flex-start",
            height: 55.667 // 🍔 Big (M)hack of the death of the world. The `alignItems` property doesn't seem to work here.
          }
        },
        navigation
      ),
  },
  notifications: {
    screen: NotificationListPage,
    navigationOptions: ({ navigation }: { navigation: NavigationScreenProp<{}> }) =>
    alternativeNavScreenOptions(
      {
        title: I18n.t("Notifications"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
      },
      navigation
    ),
  }
});

export default (apps: any[]) => {
    const filter = (mod: IAppModule) => mod.config.hasRight(apps) && mod.config.group;
    const modules = getModules(filter);
    return createStackNavigator({
      myApps: MyAppGridContainer(modules),
      ...getRoutes(modules)
    }, {
      headerMode: "none"
    });
  };
