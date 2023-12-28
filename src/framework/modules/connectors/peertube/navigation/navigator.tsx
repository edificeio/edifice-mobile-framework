import * as React from 'react';

import ConnectorRedirectScreen, { computeNavBar as homeNavBar } from '~/framework/modules/connectors/common/redirect-screen';
import moduleConfig from '~/framework/modules/connectors/peertube/module-config';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { PeertubeNavigationParams, peertubeRouteNames } from '.';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<PeertubeNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen
        name={peertubeRouteNames.home}
        component={ConnectorRedirectScreen}
        options={homeNavBar}
        initialParams={{
          url: apps[0].address.startsWith('/auth')
            ? encodeURIComponent(
                `https://mon.lyceeconnecte.fr/auth/oauth2/auth?response_type=code&scope=directory&client_id=peertube&state=state&redirect_uri=${encodeURIComponent(
                  'https://peertube.lyceeconnecte.fr/proxy',
                )}`,
              )
            : apps[0].address,
        }}
      />
    </>
  ));
