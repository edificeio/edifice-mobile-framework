import React from 'react';

import { useSelector } from 'react-redux';

import { buildAppLookupMap, resolveAppTheme, selectAggregatedApps } from '~/framework/modules/myapps/reducer';
import { IAppThemeInfo } from '~/framework/util/moduleTool';

/**
 * Returns the theme for an app from its identifier.
 *
 * appName can be a module name or backend app name.
 * Returns app colors and icon, or the default theme if not found.
 *
 * @param appName App identifier
 * @returns IAppThemeInfo
 */
export function useAppTheme(appName: string): IAppThemeInfo {
  const aggregatedApps = useSelector(selectAggregatedApps);

  return React.useMemo(() => {
    const lookupMap = buildAppLookupMap(aggregatedApps ?? {});
    return resolveAppTheme(appName, lookupMap) ?? getDefaultAppTheme();
  }, [aggregatedApps, appName]);
}

/**
 * Default app theme to use as fallback
 */
function getDefaultAppTheme(): IAppThemeInfo {
  const theme = require('~/app/theme').default;

  return {
    colors: theme.palette.grey,
    icon: 'ui-infoCircle',
  };
}
