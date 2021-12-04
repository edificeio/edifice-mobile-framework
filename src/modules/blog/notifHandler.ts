/**
 * Blog notif handler
 */

import moduleConfig from './moduleConfig';

import { computeRelativePath } from '~/framework/util/navigation';
import type { IResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';

export interface IBlogNotification extends ITimelineNotification, IResourceUriNotification {}

const handleBlogNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navState) => async (dispatch, getState) => {
    mainNavNavigate(computeRelativePath(`${moduleConfig.routeName}/details`, navState), {
      notification,
    });
    return {
      managed: 1,
      trackInfo: { action: 'Blog', name: `${notification.type}.${notification['event-type']}` },
    };
  };

export default () =>
  registerNotifHandlers([
    {
      type: 'BLOG',
      'event-type': 'PUBLISH-POST',
      notifHandlerAction: handleBlogNotificationAction,
    },
  ]);
