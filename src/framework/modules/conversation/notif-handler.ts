/**
 * Conversation notif handler
 *
 * The notifHandler registers some behaviours for given notif types and event-types.
 * It applicates to both timelineNotififation and pushNotifications.
 */
import moduleConfig from '~/framework/modules/schoolbook/module-config';
import { navigate } from '~/framework/navigation/helper';
import { computeRelativePath } from '~/framework/util/navigation';
import { IResourceIdNotification } from '~/framework/util/notifications';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';

const handleConversationNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navState) => async (dispatch, getState) => {
    const route = computeRelativePath(`${moduleConfig.routeName}/mail-content`, navState);
    navigate(route, {
      notification,
      mailId: (notification as IResourceIdNotification).resource.id,
    });
    return {
      managed: 1,
      trackInfo: { action: 'Conversation', name: `${notification.type}.${notification['event-type']}` },
    };
  };

export default () =>
  registerNotifHandlers([
    {
      type: 'MESSAGERIE',
      'event-type': 'SEND-MESSAGE',
      notifHandlerAction: handleConversationNotificationAction,
    },
  ]);
