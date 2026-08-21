import React from 'react';

import { useSelector } from 'react-redux';

import { getAppLookupMap } from '~/framework/modules/myapps/hooks/lookup';
import { NotificationOfApp, useNotificationApp } from '~/framework/modules/myapps/hooks/use-notification-app';
import { resolveAppTheme, selectAggregatedApps } from '~/framework/modules/myapps/reducer';
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

  return React.useMemo(
    () => resolveAppTheme(appName, getAppLookupMap(aggregatedApps)) ?? getDefaultAppTheme(),
    [aggregatedApps, appName],
  );
}

/**
 * Default app theme to use as fallback
 */
export function getDefaultAppTheme(): IAppThemeInfo {
  const theme = require('~/app/theme').default;

  return {
    colors: theme.palette.grey,
    icon: 'ui-infoCircle',
  };
}

/**
 * Returns the theme of the app a notification comes from.
 *
 * @returns IAppThemeInfo or undefined when the app is unknown
 */
export function useNotificationAppTheme(notification: NotificationOfApp): IAppThemeInfo | undefined {
  return useNotificationApp(notification).theme;
}
