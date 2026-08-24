import React from 'react';

import { useSelector } from 'react-redux';

import { getAppLookupMap } from '~/framework/modules/myapps/hooks/lookup';
import { NotificationOfApp, useNotificationApp } from '~/framework/modules/myapps/hooks/use-notification-app';
import { resolveAppBadge, selectAggregatedApps } from '~/framework/modules/myapps/reducer';
import { IAppBadgeInfo } from '~/framework/util/moduleTool';

/**
 * Returns the badge for an app from its identifier.
 *
 * appName can be a module name or backend app name.
 * Returns badge color and icon.
 *
 * @param appName App identifier
 * @returns IAppBadgeInfo
 */
export function useAppBadge(appName: string): IAppBadgeInfo {
  const aggregatedApps = useSelector(selectAggregatedApps);

  return React.useMemo(() => resolveAppBadge(appName, getAppLookupMap(aggregatedApps)), [aggregatedApps, appName]);
}

/**
 * Returns the badge of the app a notification comes from.
 *
 * @returns IAppBadgeInfo or undefined
 */
export function useNotificationBadge(notification: NotificationOfApp): IAppBadgeInfo | undefined {
  return useNotificationApp(notification).badge;
}
