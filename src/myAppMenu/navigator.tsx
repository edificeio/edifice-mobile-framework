import * as React from "react";
import { createStackNavigator } from "react-navigation";

import { AppTitle, Header } from "../ui/headers/Header";
import { IAppModule } from "../infra/moduleTool";
import { getRoutes, standardNavScreenOptions, getModules } from "../navigation/helpers/navBuilder";
import MyAppGrid from "./components/MyAppGrid";

export default (apps: string[]) => {
    const filter = (mod: IAppModule) => mod.config.hasRight(apps) && mod.config.group;
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
      ...getRoutes(modules)
    });
  };
