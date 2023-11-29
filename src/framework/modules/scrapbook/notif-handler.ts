import { CommonActions } from '@react-navigation/native';

import { scrapbookRouteNames } from '~/framework/modules/scrapbook/navigation';
import timelineModuleConfig from '~/framework/modules/timeline/module-config';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import type { IResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';
import {
  NotifHandlerThunkAction,
  handleNotificationNavigationAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

export interface IScrapbookNotification extends ITimelineNotification, IResourceUriNotification {}

const handleSomeNotificationAction: NotifHandlerThunkAction<IScrapbookNotification> =
  (notification, trackCategory, navigation) => async (dispatch, getState) => {
    try {
      const navAction = CommonActions.navigate({
        name: computeTabRouteName(timelineModuleConfig.routeName),
        params: {
          initial: false,
          screen: scrapbookRouteNames.details,
          params: { resourceUri: notification.resource.uri },
        },
      });

      handleNotificationNavigationAction(navAction);

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
      type: 'SCRAPBOOK',
      'event-type': ['SHARE', 'MODIFIED'],
      notifHandlerAction: handleSomeNotificationAction,
    },
  ]);
