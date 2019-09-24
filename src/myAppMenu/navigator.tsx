import * as React from "react";
import { createStackNavigator, NavigationScreenProp } from "react-navigation";
import I18n from "i18n-js";

import { IAppModule } from "../infra/moduleTool";
import { getRoutes, getModules } from "../navigation/helpers/navBuilder";
import { standardNavScreenOptions } from "../navigation/helpers/navScreenOptions";
import MyAppGrid from "./components/MyAppGrid";

const MyAppGridContainer = (modules: IAppModule[]) => createStackNavigator({
  myAppsGrid: {
    screen: (props: any) => <MyAppGrid {...props} modules={modules} />,
    navigationOptions: ({ navigation }: { navigation: NavigationScreenProp<{}> }) =>
      standardNavScreenOptions(
        {
          title: I18n.t("MyApplications")
        },
        navigation
      ),
  }
});

export default (apps: string[]) => {
    const filter = (mod: IAppModule) => mod.config.hasRight(apps) && mod.config.group;
    const modules = getModules(filter);
    return createStackNavigator({
      myApps: MyAppGridContainer(modules),
      ...getRoutes(modules)
    }, {
      headerMode: "none"
    });
  };
