/**
 * Timeline notif handler
 */
import { StackActions } from '@react-navigation/native';

import { navigate, navigationRef } from '~/framework/navigation/helper';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';

import moduleConfig from './moduleConfig';
import { timelineRouteNames } from './navigation';

const handleFlashMsgNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  navigationRef.dispatch(StackActions.popToTop());
  navigate(computeTabRouteName(moduleConfig.routeName), {
    initial: true,
    screen: timelineRouteNames.Home,
    params: {
      notification,
    },
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
