import * as React from 'react';

import { PronoteNavigationParams, pronoteRouteNames } from '.';

import ConnectorRedirectScreen, { computeNavBar as homeNavBar } from '~/framework/modules/connectors/common/redirect-screen';
import moduleConfig from '~/framework/modules/connectors/pronote/module-config';
import ConnectorSelectorScreen, {
  computeNavBar as selectorNavBar,
} from '~/framework/modules/connectors/pronote/screens/connector-selector/screen';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { AnyNavigableModule } from '~/framework/util/moduleTool';

const getPronoteRedirectUrl = (connectorAddress: string) => {
  const getSlash = (link: string) => {
    return link.charAt(link.length - 1) === '/' ? '' : '/';
  };
  return `${connectorAddress}${getSlash(connectorAddress)}mobile.html`;
};

export default (({ matchingApps }) =>
  createModuleNavigator<PronoteNavigationParams>(moduleConfig.name, Stack => (
    <>
      {matchingApps.length > 1 ? (
        <Stack.Screen
          name={pronoteRouteNames.home}
          component={ConnectorSelectorScreen}
          options={selectorNavBar}
          initialParams={{ matchingApps }}
        />
      ) : (
        <Stack.Screen
          name={pronoteRouteNames.home}
          component={ConnectorRedirectScreen}
          options={homeNavBar}
          initialParams={{
            url: matchingApps[0] ? getPronoteRedirectUrl(matchingApps[0].address) : undefined,
          }}
        />
      )}
    </>
  ))) as AnyNavigableModule['getRoot'];
