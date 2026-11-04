/**
 * The app of a notification, and how to show it (the badge of a notification).
 * The app of a notification type is given by its definition (`app-name`), loaded by `timeline`.
 * ToDo(timeline-migration): the definitions are still read from the redux store of the old `timeline` (see the architecture question
 * « notifications vs `timeline` » in `docs/migrations/STATUS.md`).
 */
import React from 'react';

import { useSelector } from 'react-redux';

import type { ThemeColorName } from '~/app/theme';
import { registeredNotificationTypesData } from '~/framework/modules/timeline/reducer/notif-definitions/selectors';
import { type EntAppDisplay, getAppShades, useEntApp, useEntAppDisplay } from '~/modules/myapps/hooks';
import type { EntApp } from '~/modules/myapps/model';

/** Notification types that are not shown like their app (key: `<type>.<event-type>`). */
const NOTIFICATION_DISPLAY_OVERRIDES: Record<string, { color?: ThemeColorName; icon?: string }> = {
  'ELEA.EXTERNAL_NOTIFICATION': { color: 'indigo', icon: 'elea' },
  'TIMELINE.NOTIFY-REPORT': { color: 'yellow', icon: 'report' },
};

/** The app of a notification type, if the user has it. */
export const useNotificationEntApp = (type: string, eventType: string): EntApp | undefined => {
  const notifTypes = useSelector(registeredNotificationTypesData);
  const appName = React.useMemo(
    () => notifTypes.find(notifType => notifType.type === type && notifType['event-type'] === eventType)?.['app-name'] ?? undefined,
    [eventType, notifTypes, type],
  );
  return useEntApp(appName);
};

/**
 * How to show a notification type: like its app (see `useEntAppDisplay`), unless the type has its own colors or icon. Nothing when
 * the user doesn't have its app.
 */
export const useNotificationDisplay = (type: string, eventType: string): EntAppDisplay | undefined => {
  const app = useNotificationEntApp(type, eventType);
  const display = useEntAppDisplay(app?.name);
  return React.useMemo(() => {
    if (!app) return undefined;
    const override = NOTIFICATION_DISPLAY_OVERRIDES[`${type}.${eventType}`];
    if (!override) return display;
    return { ...display, colors: getAppShades(override.color) ?? display.colors, icon: override.icon ?? display.icon };
  }, [app, display, eventType, type]);
};
