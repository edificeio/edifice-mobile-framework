import { IResourceIdNotification } from '~/framework/util/notifications';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';

const handleZimbraNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  mainNavNavigate(`mailDetail`, {
    notification,
    mailId: (notification as IResourceIdNotification).resource.id,
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
