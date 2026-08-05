import { CommonActions } from '@react-navigation/native';

import { getHomeTabRouteName } from '~/framework/navigation/homeTarget';
import type { IResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';
import {
  handleNotificationNavigationAction,
  NotifHandlerThunkAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

import { presencesRouteNames } from './navigation';

export interface IPresencesNotification extends ITimelineNotification, IResourceUriNotification {}

const handlePresencesEventNotificationAction: NotifHandlerThunkAction<IPresencesNotification> =
  (notification, trackCategory, navigation, dispatch) => async () => {
    try {
      const navAction = CommonActions.navigate({
        name: getHomeTabRouteName(),
        params: {
          initial: false,
          params: { notification },
          screen: presencesRouteNames.history,
        },
      });

      handleNotificationNavigationAction(navAction, navigation, dispatch);

      return {
        managed: 1,
        trackInfo: { action: 'Presences', name: `${notification.type}.${notification['event-type']}` },
      };
    } catch {
      return { managed: 0 };
    }
  };

export default () =>
  registerNotifHandlers([
    {
      'event-type': ['EVENT-CREATION', 'EVENT-UPDATE'],
      'notifHandlerAction': handlePresencesEventNotificationAction,
      'type': 'PRESENCES',
    },
  ]);
