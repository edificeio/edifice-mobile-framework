import { navigate } from '~/framework/navigation/helper';
import { IResourceIdNotification } from '~/framework/util/notifications';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';

import { ZimbraNavigationParams, zimbraRouteNames } from './navigation';

const handleZimbraNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  navigate<ZimbraNavigationParams, typeof zimbraRouteNames.mail>(zimbraRouteNames.mail, {
    folderPath: '/Inbox',
    id: (notification as IResourceIdNotification).resource.id,
    subject: notification.backupData.params.subject,
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
