import { navigate } from '~/framework/navigation/helper';
import { getAsResourceIdNotification } from '~/framework/util/notifications';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';

import { ZimbraNavigationParams, zimbraRouteNames } from './navigation';

const handleZimbraNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  const notif = getAsResourceIdNotification(notification);
  // As conversation & zimbra use same type & event-type
  // We must redirect only zimbra ones
  if (!notif || notif?.resource.uri.indexOf('zimbra') === -1) return { managed: 0 };
  navigate<ZimbraNavigationParams, typeof zimbraRouteNames.mail>(zimbraRouteNames.mail, {
    folderPath: '/Inbox',
    id: notif.resource.id,
    subject: notif.backupData.params.subject,
  });

  return {
    managed: 1,
    trackInfo: { action: 'Zimbra', name: `${notification.type}.${notification['event-type']}` },
  };
};

export default () =>
  registerNotifHandlers([
    {
      type: 'MESSAGERIE',
      'event-type': 'SEND-MESSAGE',
      notifHandlerAction: handleZimbraNotificationAction,
    },
  ]);
