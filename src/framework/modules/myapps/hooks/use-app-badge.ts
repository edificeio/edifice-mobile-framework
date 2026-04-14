import React from 'react';

import { useSelector } from 'react-redux';

import {
  buildAppNameToBadge,
  buildNotifTypeToBadge,
  resolveBadgeByAppName,
  selectAggregatedApps,
} from '~/framework/modules/myapps/reducer';
import { AppBadgesType } from '~/framework/modules/myapps/types';
import { registeredNotificationTypesData } from '~/framework/modules/timeline/reducer/notif-definitions/selectors';
import { IAppBadgeInfo } from '~/framework/util/moduleTool';

/**
 * Get a specific app badge by app/module name
 * Takes app/module name as REQUIRED parameter
 * Returns the badge info (color + icon) for that app/module
 *
 * @param appName - The app/module name
 * @returns IAppBadgeInfo with color and icon
 */
export function useAppBadge(appName: string): IAppBadgeInfo {
  const aggregatedApps = useSelector(selectAggregatedApps);

  return React.useMemo(() => {
    const appBadgesByName = buildAppNameToBadge(aggregatedApps ?? []);
    return resolveBadgeByAppName(appName, appBadgesByName);
  }, [aggregatedApps, appName]);
}

/**
 * Get all notification badges indexed by notification type
 * Used to map notification types to badges
 *
 * @returns AppBadgesType mapping notif.type to IAppBadgeInfo
 *
 * @example
 * const notifBadges = useAllNotificationBadges();
 * const badge = notifBadges['USERBOOK_MOTTO'];
 */
export function useAllNotificationBadges(): AppBadgesType {
  const aggregatedApps = useSelector(selectAggregatedApps);
  const notifTypes = useSelector(registeredNotificationTypesData);

  return React.useMemo(() => {
    if (!Object.keys(aggregatedApps ?? {}).length || !notifTypes?.length) {
      return {};
    }

    return buildNotifTypeToBadge(aggregatedApps, notifTypes);
  }, [aggregatedApps, notifTypes]);
}
