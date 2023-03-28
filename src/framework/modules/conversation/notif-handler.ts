/**
 * Conversation notif handler
 *
 * The notifHandler registers some behaviours for given notif types and event-types.
 * It applicates to both timelineNotififation and pushNotifications.
 */
import { navigate } from '~/framework/navigation/helper';
import { getAsResourceIdNotification } from '~/framework/util/notifications';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';

import { ConversationNavigationParams, conversationRouteNames } from './navigation';

const handleConversationNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navState) => async (dispatch, getState) => {
    const notif = getAsResourceIdNotification(notification);
    // As conversation & zimbra use same type & event-type
    // We must redirect only conversation ones
    if (!notif || notif?.resource.uri.indexOf('conversation') === -1) return { managed: 0 };
    navigate<ConversationNavigationParams, typeof conversationRouteNames.mailContent>(conversationRouteNames.mailContent, {
      notification: notif,
      mailId: notif.resource.id,
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
