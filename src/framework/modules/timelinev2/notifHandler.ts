/**
 * Timeline notif handler
 */
import { navigate } from '~/framework/navigation/helper';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';

import { ITimelineNavigationParams, timelineRouteNames } from './navigation';

const handleFlashMsgNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  navigate<ITimelineNavigationParams, typeof timelineRouteNames.Home>(timelineRouteNames.Home, {
    notification,
  });
  return {
    managed: 1,
    trackInfo: { action: 'Timeline', name: `${notification.type}.${notification['event-type']}` },
  };
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
