/**
 * Conversation notif handler
 *
 * The notifHandler registers some behaviours for given notif types and event-types.
 * It applicates to both timelineNotififation and pushNotifications.
 */
import { CommonActions } from '@react-navigation/native';

import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { getAsResourceIdNotification } from '~/framework/util/notifications';
import {
  NotifHandlerThunkAction,
  handleNotificationNavigationAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

import moduleConfig from './module-config';
import { conversationRouteNames } from './navigation';

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
                screen: conversationRouteNames.mailContent,
                params: {
                  notification: notif,
                  mailId: notif.resource.id,
                },
              },
            }
          : {
              name: conversationRouteNames.mailContent,
              params: {
                notification: notif,
                mailId: notif.resource.id,
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
      type: 'MESSAGERIE',
      'event-type': 'SEND-MESSAGE',
      notifHandlerAction: handleConversationNotificationAction,
    },
  ]);
