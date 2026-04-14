import React from 'react';

import { useSelector } from 'react-redux';

import { buildAppNameToTheme, selectAggregatedApps } from '~/framework/modules/myapps/reducer';
import { IAppThemeInfo } from '~/framework/util/moduleTool';

/**
 * Get the complete theme information for a specific app
 * Takes app moduleName/appName as a required parameter
 * Returns colors (regular, pale, dark,...) and icon
 *
 * @param appName: Name of the app/module
 * @returns IAppThemeInfo with full color palette and icon
 */
export function useAppTheme(appName: string): IAppThemeInfo {
  const aggregatedApps = useSelector(selectAggregatedApps);

  return React.useMemo(() => {
    const appThemesByName = buildAppNameToTheme(aggregatedApps ?? []);
    return appThemesByName[appName.toUpperCase()] ?? getDefaultAppTheme();
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
