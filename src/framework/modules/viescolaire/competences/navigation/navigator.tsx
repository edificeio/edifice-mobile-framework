import * as React from 'react';

import moduleConfig from '~/framework/modules/viescolaire/competences/module-config';
import CompetencesHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/viescolaire/competences/screens/home';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { CompetencesNavigationParams, competencesRouteNames } from '.';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<CompetencesNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={competencesRouteNames.home} component={CompetencesHomeScreen} options={homeNavBar} initialParams={{}} />
    </>
  ));
