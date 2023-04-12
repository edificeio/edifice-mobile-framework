/**
 * Schoolbook notif handler
 *
 * The notifHandler registers some behaviours for given notif types and event-types.
 * It applicates to both timelineNotififation and pushNotifications.
 */
import { StackActions } from '@react-navigation/native';

import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import timelineModuleConfig from '~/framework/modules/timelinev2/moduleConfig';
import { navigate, navigationRef } from '~/framework/navigation/helper';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import type { IResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';

import { schoolbookRouteNames } from './navigation';

export interface ISchoolbookNotification extends ITimelineNotification, IResourceUriNotification {}

const handleSchoolbookNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navState) => async (dispatch, getState) => {
    const userType = getSession()?.user?.type;
    if (!userType) return { managed: 0 };

    const isParent = userType === UserType.Relative;
    if (isParent) {
      navigationRef.dispatch(StackActions.popToTop());
      navigate(computeTabRouteName(timelineModuleConfig.routeName), {
        initial: false,
        screen: schoolbookRouteNames.home,
      });
    } else {
      navigationRef.dispatch(StackActions.popToTop());
      navigate(computeTabRouteName(timelineModuleConfig.routeName), {
        initial: false,
        screen: schoolbookRouteNames.details,
        params: {
          notification,
        },
      });
    }
    return {
      managed: 1,
      trackInfo: { action: 'Schoolbook', name: `${notification.type}.${notification['event-type']}` },
    };
  };

export default () =>
  registerNotifHandlers([
    {
      type: 'SCHOOLBOOK',
      'event-type': ['PUBLISH', 'WORD-SHARED', 'WORD-RESEND', 'ACKNOWLEDGE', 'RESPONSE', 'MODIFYRESPONSE'],
      notifHandlerAction: handleSchoolbookNotificationAction,
    },
  ]);
