/**
 * Schoolbook notif handler
 *
 * The notifHandler registers some behaviours for given notif types and event-types.
 * It applicates to both timelineNotififation and pushNotifications.
 */
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import moduleConfig from '~/framework/modules/schoolbook/module-config';
import { navigate } from '~/framework/navigation/helper';
import { computeRelativePath } from '~/framework/util/navigation';
import type { IResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';

export interface ISchoolbookNotification extends ITimelineNotification, IResourceUriNotification {}

const handleSchoolbookNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navState) => async (dispatch, getState) => {
    const userType = getSession(getState())?.user?.type;
    if (!userType) return { managed: 0 };

    const isParent = userType === UserType.Relative;
    const route = computeRelativePath(`${moduleConfig.routeName}${isParent ? '' : '/details'}`, navState);
    navigate(route, {
      notification,
    });
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
