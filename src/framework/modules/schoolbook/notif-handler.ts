/**
 * Schoolbook notif handler
 *
 * The notifHandler registers some behaviours for given notif types and event-types.
 * It applicates to both timelineNotififation and pushNotifications.
 */
import { CommonActions } from '@react-navigation/native';

import { assertSession } from '~/framework/modules/auth/reducer';
import timelineModuleConfig from '~/framework/modules/timeline/module-config';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import type { IResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';
import {
  NotifHandlerThunkAction,
  handleNotificationNavigationAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

import { schoolbookRouteNames } from './navigation';
import { AccountType } from '../auth/model';

export interface ISchoolbookNotification extends ITimelineNotification, IResourceUriNotification {}

const handleSchoolbookNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navigation) => async (dispatch, getState) => {
    try {
      // 1. Get notification data
      const userType = assertSession().user.type;
      const isParent = userType === AccountType.Relative;

      // 2. actual navigation action
      const navAction = CommonActions.navigate({
        name: computeTabRouteName(timelineModuleConfig.routeName),
        params: isParent
          ? {
              initial: false,
              screen: schoolbookRouteNames.home,
            }
          : {
              initial: false,
              screen: schoolbookRouteNames.details,
              params: {
                notification,
              },
            },
      });

      // 3. Go !
      handleNotificationNavigationAction(navAction);

      // 4. Return notif handling result
      return {
        managed: 1,
        trackInfo: { action: 'Schoolbook', name: `${notification.type}.${notification['event-type']}` },
      };
    } catch {
      return { managed: 0 };
    }
  };

export default () =>
  registerNotifHandlers([
    {
      type: 'SCHOOLBOOK',
      'event-type': ['PUBLISH', 'WORD-SHARED', 'WORD-RESEND', 'ACKNOWLEDGE', 'RESPONSE', 'MODIFYRESPONSE'],
      notifHandlerAction: handleSchoolbookNotificationAction,
    },
  ]);
