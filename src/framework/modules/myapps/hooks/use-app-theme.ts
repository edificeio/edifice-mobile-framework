import React from 'react';

import { useSelector } from 'react-redux';

import {
  buildAppLookupMap,
  buildNotifTypeLookupMap,
  resolveAppShades,
  resolveAppTheme,
  selectAggregatedApps,
} from '~/framework/modules/myapps/reducer';
import { registeredNotificationTypesData } from '~/framework/modules/timeline/reducer/notif-definitions/selectors';
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
 * The notification type names its app, whose shades and icon are then resolved, the same way
 * `useNotificationBadge` resolves its badge.
 *
 * @param notifType Notification type
 * @param eventType Notification event type
 * @returns IAppThemeInfo or undefined when the app is unknown
 */
export function useNotificationAppTheme(notifType: string, eventType: string): IAppThemeInfo | undefined {
  const aggregatedApps = useSelector(selectAggregatedApps);
  const notifTypes = useSelector(registeredNotificationTypesData);

  const notifTypeMap = React.useMemo(() => buildNotifTypeLookupMap(notifTypes ?? []), [notifTypes]);

  return React.useMemo(() => {
    const appName = notifTypeMap.get(`${notifType}.${eventType}`)?.['app-name'];
    if (!appName) return undefined;

    const app = aggregatedApps?.[appName];
    return app ? { colors: resolveAppShades(app.color), icon: app.icon } : undefined;
  }, [aggregatedApps, notifTypeMap, notifType, eventType]);
}
