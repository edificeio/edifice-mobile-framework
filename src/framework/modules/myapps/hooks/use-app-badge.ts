import React from 'react';

import { useSelector } from 'react-redux';

import {
  buildAppLookupMap,
  buildNotifTypeLookupMap,
  resolveAppBadge,
  resolveNotifBadge,
  selectAggregatedApps,
} from '~/framework/modules/myapps/reducer';
import { registeredNotificationTypesData } from '~/framework/modules/timeline/reducer/notif-definitions/selectors';
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

  return React.useMemo(() => {
    const lookupMap = buildAppLookupMap(aggregatedApps ?? {});
    return resolveAppBadge(appName, lookupMap);
  }, [aggregatedApps, appName]);
}

/**
 * Returns the badge for a notification type.
 *
 * The notification type is linked to an app,
 * then the app badge is resolved from aggregated apps.
 *
 * @param notifType Notification type
 * @returns IAppBadgeInfo or undefined
 */
export function useNotificationBadge(notifType: string, eventType: string): IAppBadgeInfo | undefined {
  const aggregatedApps = useSelector(selectAggregatedApps);
  const notifTypes = useSelector(registeredNotificationTypesData);

  const notifTypeMap = React.useMemo(() => buildNotifTypeLookupMap(notifTypes ?? []), [notifTypes]);

  return React.useMemo(
    () => resolveNotifBadge(`${notifType}.${eventType}`, notifTypeMap, aggregatedApps ?? {}),
    [aggregatedApps, notifTypeMap, notifType, eventType],
  );
}
