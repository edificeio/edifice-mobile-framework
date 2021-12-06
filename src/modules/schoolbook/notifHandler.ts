/**
 * Schoolbook notif handler
 */

import type { IResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';

export interface ISchoolbookNotification extends ITimelineNotification, IResourceUriNotification {}

const handleSchoolbookNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  mainNavNavigate('SchoolbookWordDetailsScreenRouter', {
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
