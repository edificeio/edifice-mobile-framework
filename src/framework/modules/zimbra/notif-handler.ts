import { CommonActions } from '@react-navigation/native';

import moduleConfig from './module-config';
import { zimbraRouteNames } from './navigation';

import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { getAsResourceIdNotification } from '~/framework/util/notifications';
import {
  handleNotificationNavigationAction,
  NotifHandlerThunkAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

const handleZimbraNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navigation, allowSwitchTab) => async (dispatch, getState) => {
    try {
      const notif = getAsResourceIdNotification(notification);
      // As conversation & zimbra use same type & event-type
      // We must redirect only zimbra ones
      if (!notif || notif?.resource.uri.indexOf('zimbra') === -1) return { managed: 0 };

      const navAction = CommonActions.navigate(
        allowSwitchTab
          ? {
              name: computeTabRouteName(moduleConfig.routeName),
              params: {
                initial: true,
                params: {
                  folderPath: '/Inbox',
                  id: notif.resource.id,
                  subject: notif.backupData.params.subject,
                },
                screen: zimbraRouteNames.mail,
              },
            }
          : {
              name: zimbraRouteNames.mail,
              params: {
                folderPath: '/Inbox',
                id: notif.resource.id,
                subject: notif.backupData.params.subject,
              },
            }
      );

      handleNotificationNavigationAction(navAction);

      return {
        managed: 1,
        trackInfo: { action: 'Zimbra', name: `${notification.type}.${notification['event-type']}` },
      };
    } catch {
      return { managed: 0 };
    }
  };

export default () =>
  registerNotifHandlers([
    {
      'event-type': 'SEND-MESSAGE',
      'notifHandlerAction': handleZimbraNotificationAction,
      'type': 'MESSAGERIE',
    },
  ]);
