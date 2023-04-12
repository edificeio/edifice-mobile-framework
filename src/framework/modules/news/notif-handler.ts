/**
 * News notif handler
 * @scaffolder Remove this file if your module handles no notification.
 *
 * The notifHandler registers some behaviours for given notif types and event-types.
 * It applicates to both timelineNotififation and pushNotifications.
 */
import { StackActions } from '@react-navigation/native';

import timelineModuleConfig from '~/framework/modules/timelinev2/moduleConfig';
import { navigate, navigationRef } from '~/framework/navigation/helper';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import type { IResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';

import { newsRouteNames } from './navigation';

export interface INewsNotification extends ITimelineNotification, IResourceUriNotification {}

const handleSomeNotificationAction: NotifHandlerThunkAction<INewsNotification> = notification => async (dispatch, getState) => {
  navigationRef.dispatch(StackActions.popToTop());
  navigate(computeTabRouteName(timelineModuleConfig.routeName), {
    initial: false,
    screen: newsRouteNames.newsDetails,
    params: { notification },
  });

  return {
    managed: 1,
    trackInfo: { action: 'News', name: `${notification.type}.${notification['event-type']}` },
  };
};

export default () =>
  registerNotifHandlers([
    {
      type: 'NEWS',
      'event-type': ['INFO-SHARED', 'NEWS-PUBLISHED'], // Replace this with the backend notification event-type
      notifHandlerAction: handleSomeNotificationAction,
    },
  ]);
