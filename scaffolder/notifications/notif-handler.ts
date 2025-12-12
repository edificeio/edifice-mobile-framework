import { CommonActions } from '@react-navigation/native';

import timelineModuleConfig from '~/framework/modules/timeline/module-config';
import { {{moduleName}}RouteNames } from '~/framework/modules/{{moduleName}}/navigation';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { getAsResourceUriNotification } from '~/framework/util/notifications';
import {
  handleNotificationNavigationAction,
  NotifHandlerThunkAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';


const handle{{ moduleName | toCamelCase | capitalize }}NotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  try {
    const resourceNotif = getAsResourceUriNotification(notification);
    if (!resourceNotif) return { managed: 0 };

    const resourceId = ''; // Extract Ids & data from resourceNotif

    // Please return `{ managed: 0 }` or throw something when something bad happen and notification cannot be processed;

    const navAction = CommonActions.navigate({
      name: computeTabRouteName(timelineModuleConfig.routeName),
      params: {
        initial: false,
        params: {
          resourceId,
        },
        screen: {{ moduleName | toCamelCase }}RouteNames.home,
      },
    });

    handleNotificationNavigationAction(navAction);

    return {
      managed: 1,
      trackInfo: { action: '{{ moduleName | toCamelCase | capitalize }}', name: `${notification.type}.${notification['event-type']}` },
    };
  } catch {
    return { managed: 0 };
  }
};

export default () =>
  registerNotifHandlers([
    {
      'event-type': ['SHARED'],
      'notifHandlerAction': handle{{ moduleName | toCamelCase | capitalize }}NotificationAction,
      'type': '{{ moduleName | toUpperCase }}',
    },
  ]);

// ToDo : @scaffolder import this file in `index.ts` of your module.