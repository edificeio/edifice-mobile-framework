import * as React from "react";
import { createStackNavigator } from "react-navigation";
import { AppTitle, Header } from "../../ui/headers/Header";
import { IAppModule } from "../../infra/moduleTool";
import { getRoutes, standardNavScreenOptions, getModules } from "../../navigation/helpers/navBuilder";
import MyAppGrid from "../components/MyAppGrid";

/**
 * APP NAVIGATOR
 * This navigator is built dynamically from functional modules.
 */

export const getMyAppNavigator = (apps: string[]) => {
  const filter = (mod: IAppModule) => apps.includes(mod.config.apiName) && mod.config.group;
  const modules = getModules(filter);
  return createStackNavigator({
    myApps: {
      screen: props => <MyAppGrid {...props} modules={modules} />,

      navigationOptions: ({ navigation }) =>
        standardNavScreenOptions(
          {
            header: (
              <Header>
                <AppTitle>{"Mes Applis"}</AppTitle>
              </Header>
            ),
          },
          navigation
        ),
    },
    ...getRoutes(modules),
  });
};
