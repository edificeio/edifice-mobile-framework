import { CommonActions } from '@react-navigation/native';

import { scrapbookRouteNames } from '~/framework/modules/scrapbook/navigation';
import { getHomeTabRouteName } from '~/framework/navigation/homeTarget';
import type { IResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';
import {
  handleNotificationNavigationAction,
  NotifHandlerThunkAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

export interface IScrapbookNotification extends ITimelineNotification, IResourceUriNotification {}

const handleSomeNotificationAction: NotifHandlerThunkAction<IScrapbookNotification> =
  (notification, trackCategory, navigation, dispatch) => async () => {
    try {
      const navAction = CommonActions.navigate({
        name: getHomeTabRouteName(),
        params: {
          initial: false,
          params: { resourceUri: notification.resource.uri },
          screen: scrapbookRouteNames.details,
        },
      });

      handleNotificationNavigationAction(navAction, navigation, dispatch);

      return {
        managed: 1,
        trackInfo: { action: 'Scrapbook', name: `${notification.type}.${notification['event-type']}` },
      };
    } catch {
      return { managed: 0 };
    }
  };

export default () =>
  registerNotifHandlers([
    {
      'event-type': ['SHARE', 'MODIFIED'],
      'notifHandlerAction': handleSomeNotificationAction,
      'type': 'SCRAPBOOK',
    },
  ]);
