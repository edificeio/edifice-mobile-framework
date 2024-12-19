import { CommonActions } from '@react-navigation/native';

import { scrapbookRouteNames } from '~/framework/modules/scrapbook/navigation';
import timelineModuleConfig from '~/framework/modules/timeline/module-config';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import type { IResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';
import {
  handleNotificationNavigationAction,
  NotifHandlerThunkAction,
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
          params: { resourceUri: notification.resource.uri },
          screen: scrapbookRouteNames.details,
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
      'event-type': ['SHARE', 'MODIFIED'],
      notifHandlerAction: handleSomeNotificationAction,
      type: 'SCRAPBOOK',
    },
  ]);
