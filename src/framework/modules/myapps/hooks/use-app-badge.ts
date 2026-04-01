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
 * Polymorphic hook to get app badges.
 *
 * @param appName -> App name to get a specific badge
 * @returns IAppBadgeInfo for that app
 *
 * @example
 * const scrapbookBadge = useAppBadge('scrapbook');
 */
export function useAppBadge(appName: string): IAppBadgeInfo;

/**
 * Get all notification badges indexed by notification type.
 *
 * @returns AppBadgesType mapping notif.type to IAppBadgeInfo
 *
 * @example
 * const notifBadges = useAppBadge();
 * const badge = notifBadges['SCRAPBOOK_COMMENT'];
 */
export function useAppBadge(): AppBadgesType;

export function useAppBadge(appName?: string): IAppBadgeInfo | AppBadgesType {
  const aggregatedApps = useSelector(selectAggregatedApps);
  const notifTypes = useSelector(registeredNotificationTypesData);

  return React.useMemo(() => {
    if (appName) {
      const appBadgesByName = buildAppNameToBadge(aggregatedApps ?? []);
      return resolveBadgeByAppName(appName, appBadgesByName);
    }

    if (!aggregatedApps?.length || !notifTypes?.length) {
      return {};
    }

    return buildNotifTypeToBadge(aggregatedApps, notifTypes);
  }, [aggregatedApps, notifTypes, appName]);
}
