/**
 * Mediacentre notif handler
 * @scaffolder Remove this file if your module handles no notification.
 *
 * The notifHandler registers some behaviours for given notif types and event-types.
 * It applicates to both timelineNotififation and pushNotifications.
 */
import { CommonActions } from '@react-navigation/native';

import { getHomeTabRouteName } from '~/framework/navigation/homeTarget';
import {
  handleNotificationNavigationAction,
  NotifHandlerThunkAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

import { mediacentreRouteNames } from './navigation';

const handleMediacentreNotificationAction: NotifHandlerThunkAction = (notification, _, navigation, dispatch) => async () => {
  try {
    const navAction = CommonActions.navigate({
      name: getHomeTabRouteName(),
      params: {
        initial: false,
        screen: mediacentreRouteNames.home,
      },
    });

    handleNotificationNavigationAction(navAction, navigation, dispatch);

    return {
      managed: 1,
      trackInfo: { action: 'Mediacentre', name: `${notification.type}.${notification['event-type']}` },
    };
  } catch {
    return { managed: 0 };
  }
};

export default () =>
  registerNotifHandlers([
    {
      'event-type': 'PINNED_RESOURCE_NOTIFICATION',
      'notifHandlerAction': handleMediacentreNotificationAction,
      'type': 'MEDIACENTRE',
    },
  ]);
