/**
 * Timeline notif handler
 */
import { CommonActions } from '@react-navigation/native';

import { computeTabRouteName } from '~/framework/navigation/tabModules';
import {
  NotifHandlerThunkAction,
  handleNotificationNavigationAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

import moduleConfig from './module-config';
import { timelineRouteNames } from './navigation';

const handleFlashMsgNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navigation) => async (dispatch, getState) => {
    try {
      const navAction = CommonActions.navigate({
        name: computeTabRouteName(moduleConfig.routeName),
        params: {
          initial: true,
          screen: timelineRouteNames.Home,
          params: {
            notification,
          },
        },
      });

      handleNotificationNavigationAction(navAction);

      return {
        managed: 1,
        trackInfo: { action: 'Timeline', name: `${notification.type}.${notification['event-type']}` },
      };
    } catch {
      return { managed: 0 };
    }
  };

// Note : by default, unmanaged notifications leads to TimelineScreen.
// But, if this default behaviour is changed in the future, this notifHandler will prevent side-effect.

export default () =>
  registerNotifHandlers([
    {
      type: 'TIMELINE',
      'event-type': 'SEND-FLASH-MESSAGE-PUSH',
      notifHandlerAction: handleFlashMsgNotificationAction,
    },
  ]);
