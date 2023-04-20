import { CommonActions } from '@react-navigation/native';

import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { getAsResourceIdNotification } from '~/framework/util/notifications';
import {
  NotifHandlerThunkAction,
  handleNotificationNavigationAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

import moduleConfig from './module-config';
import { zimbraRouteNames } from './navigation';

const handleZimbraNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navigation) => async (dispatch, getState) => {
    try {
      const notif = getAsResourceIdNotification(notification);
      // As conversation & zimbra use same type & event-type
      // We must redirect only zimbra ones
      if (!notif || notif?.resource.uri.indexOf('zimbra') === -1) return { managed: 0 };

      const navAction = CommonActions.navigate({
        name: computeTabRouteName(moduleConfig.routeName),
        params: {
          initial: true,
          screen: zimbraRouteNames.mail,
          params: {
            folderPath: '/Inbox',
            id: notif.resource.id,
            subject: notif.backupData.params.subject,
          },
        },
      });

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
      type: 'MESSAGERIE',
      'event-type': 'SEND-MESSAGE',
      notifHandlerAction: handleZimbraNotificationAction,
    },
  ]);
