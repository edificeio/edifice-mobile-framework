/**
 * Conversation notif handler
 *
 * The notifHandler registers some behaviours for given notif types and event-types.
 * It applicates to both timelineNotififation and pushNotifications.
 */
import { CommonActions } from '@react-navigation/native';

import moduleConfig from './module-config';
import { conversationRouteNames } from './navigation';

import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { getAsResourceIdNotification } from '~/framework/util/notifications';
import {
  handleNotificationNavigationAction,
  NotifHandlerThunkAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

const handleConversationNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navigation, allowSwitchTab) => async (dispatch, getState) => {
    try {
      const notif = getAsResourceIdNotification(notification);
      // As conversation & zimbra use same type & event-type
      // We must redirect only conversation ones
      if (!notif || notif?.resource.uri.indexOf('conversation') === -1) return { managed: 0 };

      const navAction = CommonActions.navigate(
        allowSwitchTab
          ? {
              name: computeTabRouteName(moduleConfig.routeName),
              params: {
                initial: false,
                params: {
                  mailId: notif.resource.id,
                  notification: notif,
                },
                screen: conversationRouteNames.mailContent,
              },
            }
          : {
              name: conversationRouteNames.mailContent,
              params: {
                mailId: notif.resource.id,
                notification: notif,
              },
            },
      );

      handleNotificationNavigationAction(navAction);

      return {
        managed: 1,
        trackInfo: { action: 'Conversation', name: `${notification.type}.${notification['event-type']}` },
      };
    } catch {
      return { managed: 0 };
    }
  };

export default () =>
  registerNotifHandlers([
    {
      'event-type': 'SEND-MESSAGE',
      notifHandlerAction: handleConversationNotificationAction,
      type: 'MESSAGERIE',
    },
  ]);
