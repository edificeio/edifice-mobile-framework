/**
 * News notif handler
 */
import { computeRelativePath } from '~/framework/util/navigation';
import type { IResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';

import moduleConfig from './moduleConfig';

export interface INewsNotification extends ITimelineNotification, IResourceUriNotification {}

const handleBlogNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navState) => async (dispatch, getState) => {
    const route = computeRelativePath(`${moduleConfig.routeName}/details`, navState);
    mainNavNavigate(route, {
      notification,
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
      'event-type': ['INFO-SHARED', 'NEWS-PUBLISHED'],
      notifHandlerAction: handleBlogNotificationAction,
    },
  ]);
