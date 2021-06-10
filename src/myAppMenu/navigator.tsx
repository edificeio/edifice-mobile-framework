import I18n from "i18n-js";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

import { getAvailableModules, getModuleRoutes, Module } from "../framework/util/moduleTool";
import { IAppModule } from "../infra/moduleTool/types";
import { getRoutes, getModules } from "../navigation/helpers/navBuilder";
import { standardNavScreenOptions } from "../navigation/helpers/navScreenOptions";
import MyAppGrid from "./components/MyAppGrid";
import { myAppsModules } from "./myAppsModules";

const MyAppGridContainer = (modules: IAppModule[], newModules: Module[]) =>
  createStackNavigator({
    myAppsGrid: {
      screen: (props: any) => <MyAppGrid {...props} modules={modules} newModules={newModules} />,
      navigationOptions: ({ navigation }: { navigation: NavigationScreenProp<{}> }) =>
        standardNavScreenOptions(
          {
            title: I18n.t("MyApplications"),
            headerLeftContainerStyle: {
              alignItems: "flex-start",
            },
            headerRightContainerStyle: {
              alignItems: "flex-start",
            },
            headerTitleContainerStyle: {
              alignItems: "flex-start",
            },
          },
          navigation
        ),
    },
  });

export default (apps: any[]) => {
  const filter = (mod: IAppModule) => mod.config.hasRight(apps) && mod.config.group;
  const modules = getModules(filter);
  const newModules = getAvailableModules(myAppsModules.get(), apps);
  return createStackNavigator(
    {
      myApps: MyAppGridContainer(modules, newModules),
      ...getRoutes(modules),
      ...getModuleRoutes(newModules),
    },
    {
      headerMode: "none",
    }
  );
};
