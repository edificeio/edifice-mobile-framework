/**
 * Collaborativewall notif handler
 * @scaffolder Remove this file if your module handles no notification.
 *
 * The notifHandler registers some behaviours for given notif types and event-types.
 * It applicates to both timelineNotififation and pushNotifications.
 */
import { CommonActions } from '@react-navigation/native';

import { collaborativewallRouteNames } from '~/framework/modules/collaborativewall/navigation';
import timelineModuleConfig from '~/framework/modules/timeline/module-config';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import appConf from '~/framework/util/appConf';
import { getAsResourceUriNotification } from '~/framework/util/notifications';
import {
  NotifHandlerThunkAction,
  handleNotificationNavigationAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

import { collaborativewallUriParser } from './service';

const handleCollaborativeWallNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  try {
    const notifData = getAsResourceUriNotification(notification);
    if (!notifData) return { managed: 0 };

    const cwallId = collaborativewallUriParser.parse(notifData.resource.uri);
    if (!cwallId) return { managed: 0 };

    const navAction = CommonActions.navigate({
      name: computeTabRouteName(timelineModuleConfig.routeName),
      params: {
        initial: false,
        screen: collaborativewallRouteNames.viewer,
        params: {
          id: cwallId,
        },
      },
    });

    handleNotificationNavigationAction(navAction);

    return {
      managed: 1,
      trackInfo: { action: 'Mur Collaboratif', name: `${notification.type}.${notification['event-type']}` },
    };
  } catch {
    return { managed: 0 };
  }
};

export default () =>
  registerNotifHandlers(
    appConf.isDevOrAlpha // Remove this line when this modules goes in production !
      ? [
          {
            type: 'COLLABORATIVEWALL',
            'event-type': 'SHARE',
            notifHandlerAction: handleCollaborativeWallNotificationAction,
          },
        ]
      : [],
  );
