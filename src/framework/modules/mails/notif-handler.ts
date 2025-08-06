/**
 * Conversation notif handler
 *
 * The notifHandler registers some behaviours for given notif types and event-types.
 * It applicates to both timelineNotififation and pushNotifications.
 */
import { CommonActions } from '@react-navigation/native';

import moduleConfig from './module-config';
import { mailsRouteNames } from './navigation';

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
                  fromTimeline: false,
                  id: notif.resource.id,
                },
                screen: mailsRouteNames.details,
              },
            }
          : {
              name: mailsRouteNames.details,
              params: {
                fromTimeline: true,
                id: notif.resource.id,
              },
            },
      );

      handleNotificationNavigationAction(navAction);

      return {
        managed: 1,
        trackInfo: { action: 'Mails', name: `${notification.type}.${notification['event-type']}` },
      };
    } catch {
      return { managed: 0 };
    }
  };

export default () =>
  registerNotifHandlers([
    {
      'event-type': 'SEND-MESSAGE',
      'notifHandlerAction': handleConversationNotificationAction,
      'type': 'MESSAGERIE',
    },
  ]);
