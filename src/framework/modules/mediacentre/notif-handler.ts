/**
 * Mediacentre notif handler
 * @scaffolder Remove this file if your module handles no notification.
 *
 * The notifHandler registers some behaviours for given notif types and event-types.
 * It applicates to both timelineNotififation and pushNotifications.
 */
import { CommonActions } from '@react-navigation/native';

import timelineModuleConfig from '~/framework/modules/timeline/module-config';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import {
  NotifHandlerThunkAction,
  handleNotificationNavigationAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

import { mediacentreRouteNames } from './navigation';

const handleMediacentreNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  try {
    const navAction = CommonActions.navigate({
      name: computeTabRouteName(timelineModuleConfig.routeName),
      params: {
        initial: false,
        screen: mediacentreRouteNames.home,
      },
    });

    handleNotificationNavigationAction(navAction);

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
      type: 'MEDIACENTRE',
      'event-type': 'PINNED_RESOURCE_NOTIFICATION',
      notifHandlerAction: handleMediacentreNotificationAction,
    },
  ]);
