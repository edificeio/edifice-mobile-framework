import * as React from 'react';
import { createStackNavigator } from 'react-navigation-stack';

import { IEntcoreApp, IEntcoreWidget, NavigableModuleArray } from '~/framework/util/moduleTool';
import { IAppModule } from '~/infra/moduleTool/types';
import { getModules, getRoutes } from '~/navigation/helpers/navBuilder';

import MyAppGrid from './components/MyAppGrid';
import { myAppsModules } from './myAppsModules';

const MyAppGridContainer = (modules: NavigableModuleArray, legacyModules: IAppModule[]) =>
  createStackNavigator(
    {
      myAppsGrid: {
        screen: (props: any) => <MyAppGrid {...props} modules={modules} legacyModules={legacyModules} />,
      },
    },
    {
      headerMode: 'none',
    },
  );

export default (matchingApps: IEntcoreApp[], matchingWidgets: IEntcoreWidget[]) => {
  const modules = new NavigableModuleArray(...myAppsModules.get().filterAvailables(matchingApps, matchingWidgets));
  const legacyFilter = (mod: IAppModule) => !!mod.config.hasRight?.(matchingApps) && !!mod.config.group;
  const legacyModules = getModules(legacyFilter);
  return createStackNavigator(
    {
      myApps: MyAppGridContainer(modules, legacyModules),
      ...modules.getRoutes(),
      ...getRoutes(legacyModules),
    },
    {
      headerMode: 'none',
    },
  );
};
