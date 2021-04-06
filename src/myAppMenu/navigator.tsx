import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import I18n from "i18n-js";

import { IAppModule } from "../infra/moduleTool/types";
import { getRoutes, getModules } from "../navigation/helpers/navBuilder";
import { standardNavScreenOptions } from "../navigation/helpers/navScreenOptions";
import MyAppGrid from "./components/MyAppGrid";

const MyAppGridContainer = (modules: IAppModule[]) => createStackNavigator({
  myAppsGrid: {
    screen: (props: any) => <MyAppGrid {...props} modules={modules} />,
    navigationOptions: ({ navigation }: { navigation: NavigationScreenProp<{}> }) =>
      standardNavScreenOptions(
        {
          title: I18n.t("MyApplications"),
          headerLeftContainerStyle: {
            alignItems: "flex-start"
          },
          headerRightContainerStyle: {
            alignItems: "flex-start"
          },
          headerTitleContainerStyle: {
            alignItems: "flex-start"
          }
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
