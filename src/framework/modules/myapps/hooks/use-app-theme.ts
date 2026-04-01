import React from 'react';

import { useSelector } from 'react-redux';

import { buildAppNameToTheme, selectAggregatedApps } from '~/framework/modules/myapps/reducer';
import { IAppThemeInfo } from '~/framework/util/moduleTool';

/**
 * Hook to get the complete theme information for a specific app
 * Returns colors (regular, pale, dark, light, evil) and icon
 *
 * @param appName: Name of the app to get theme for (optional, returns default if not provided)
 * @returns IAppThemeInfo with full color palette and icon
 *
 * @example
 * const homeworkTheme = useAppTheme('homework');
 * // homeworkTheme.colors.regular, .pale, .dark, etc.
 *
 * // For optional usage:
 * const theme = useAppTheme(appName || undefined); // returns default if appName is falsy
 */
export function useAppTheme(appName?: string | null): IAppThemeInfo {
  const aggregatedApps = useSelector(selectAggregatedApps);

  return React.useMemo(() => {
    if (!appName) {
      return getDefaultAppTheme();
    }
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
