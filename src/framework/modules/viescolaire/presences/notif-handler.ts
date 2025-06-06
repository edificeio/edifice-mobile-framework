import { CommonActions } from '@react-navigation/native';

import { presencesRouteNames } from './navigation';

import timelineModuleConfig from '~/framework/modules/timeline/module-config';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import type { IResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';
import {
  handleNotificationNavigationAction,
  NotifHandlerThunkAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

export interface IPresencesNotification extends ITimelineNotification, IResourceUriNotification {}

const handlePresencesEventNotificationAction: NotifHandlerThunkAction<IPresencesNotification> =
  (notification, trackCategory, navigation) => async (dispatch, getState) => {
    try {
      const navAction = CommonActions.navigate({
        name: computeTabRouteName(timelineModuleConfig.routeName),
        params: {
          initial: false,
          params: { notification },
          screen: presencesRouteNames.history,
        },
      });

      handleNotificationNavigationAction(navAction);

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
      notifHandlerAction: handlePresencesEventNotificationAction,
      type: 'PRESENCES',
    },
  ]);
