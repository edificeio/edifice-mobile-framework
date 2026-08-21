import React from 'react';

import { useSelector } from 'react-redux';

import { getNotifTypeLookupMap } from '~/framework/modules/myapps/hooks/lookup';
import {
  resolveAppShades,
  resolveNotifApp,
  resolveNotifBadgeFromApp,
  selectAggregatedApps,
} from '~/framework/modules/myapps/reducer';
import { registeredNotificationTypesData } from '~/framework/modules/timeline/reducer/notif-definitions/selectors';
import { IAppBadgeInfo, IAppThemeInfo } from '~/framework/util/moduleTool';
import type { IAbstractNotification } from '~/framework/util/notifications';

export type NotificationOfApp = Pick<IAbstractNotification, 'type' | 'event-type'>;

/**
 * Returns the badge and the theme of the app a notification comes from, both read at once for the
 * screens that show the two.
 */
export function useNotificationApp(notification: NotificationOfApp): {
  badge: IAppBadgeInfo | undefined;
  theme: IAppThemeInfo | undefined;
} {
  const aggregatedApps = useSelector(selectAggregatedApps);
  const notifTypes = useSelector(registeredNotificationTypesData);

  const { 'event-type': eventType, type } = notification;

  return React.useMemo(() => {
    const key = `${type}.${eventType}`;
    const app = resolveNotifApp(key, getNotifTypeLookupMap(notifTypes), aggregatedApps);

    return {
      badge: resolveNotifBadgeFromApp(key, app),
      theme: app ? { colors: resolveAppShades(app.color), icon: app.icon } : undefined,
    };
  }, [aggregatedApps, notifTypes, type, eventType]);
}
