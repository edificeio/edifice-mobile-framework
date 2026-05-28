/**
 * Conversation notif handler
 *
 * The notifHandler registers some behaviours for given notif types and event-types.
 * It applicates to both timelineNotififation and pushNotifications.
 */
import { CommonActions, TabActions } from '@react-navigation/native';

import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { getAsResourceIdNotification } from '~/framework/util/notifications';
import {
  handleNotificationNavigationAction,
  NotifHandlerThunkAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

import moduleConfig from './module-config';
import { mailsRouteNames } from './navigation';

const handleConversationNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navigation, dispatch, allowSwitchTab) => async () => {
    try {
      const notif = getAsResourceIdNotification(notification);
      // As conversation & zimbra use same type & event-type
      // We must redirect only conversation ones
      if (!notif || notif?.resource.uri.indexOf('conversation') === -1) return { managed: 0 };

      const navAction = allowSwitchTab
        ? TabActions.jumpTo(computeTabRouteName(moduleConfig.routeName), {
            initial: false,
            params: { fromTimeline: true, id: notif.resource.id },
            screen: mailsRouteNames.details,
          })
        : CommonActions.navigate(mailsRouteNames.details, {
            fromTimeline: true,
            id: notif.resource.id,
          });

      handleNotificationNavigationAction(navAction, navigation, dispatch);

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
