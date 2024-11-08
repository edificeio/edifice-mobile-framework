import * as React from 'react';

import { MoodleNavigationParams, moodleRouteNames } from '.';

import ConnectorRedirectScreen, { computeNavBar as homeNavBar } from '~/framework/modules/connectors/common/redirect-screen';
import moduleConfig from '~/framework/modules/connectors/moodle/module-config';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
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
