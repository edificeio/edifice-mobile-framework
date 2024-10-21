import * as React from 'react';

import { MoodleNavigationParams, moodleRouteNames } from '.';

import ConnectorRedirectScreen, { computeNavBar as homeNavBar } from '~/framework/modules/connectors/common/redirect-screen';
import moduleConfig from '~/framework/modules/connectors/moodle/module-config';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<MoodleNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen
        name={moodleRouteNames.home}
        component={ConnectorRedirectScreen}
        options={homeNavBar}
        initialParams={{
          appUrl: 'moodlemobile://https://moodle.lyceeconnecte.fr',
          url: 'https://mon.lyceeconnecte.fr/moodle',
        }}
      />
    </>
  ));
