/**
 * Blog notif handler
 */
import { computeRelativePath } from '~/framework/util/navigation';
import { IResourceUriNotification, ITimelineNotification, getAsResourceUriNotification } from '~/framework/util/notifications';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';
import { getUserSession } from '~/framework/util/session';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';

import moduleConfig from './moduleConfig';
import { IBlogPost } from './reducer';
import { blogService, blogUriCaptureFunction } from './service';

export interface IBlogNotification extends ITimelineNotification, IResourceUriNotification {}

const handleBlogPostNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navState) => async (dispatch, getState) => {
    const path = computeRelativePath(`${moduleConfig.routeName}/details`, navState);
    const navParams = {};
    const blogNotif = getAsResourceUriNotification(notification);
    if (!blogNotif) return { managed: 0 };

    mainNavNavigate(path, {
      notification: blogNotif,
      useNotification: true,
      ...navParams,
    });
    return {
      managed: 1,
      trackInfo: { action: 'Blog', name: `${notification.type}.${notification['event-type']}` },
    };
  };

const handleBlogNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navState) => async (dispatch, getState) => {
    try {
      const blogNotif = getAsResourceUriNotification(notification);
      if (!blogNotif) return { managed: 0 };
      const blogId = blogUriCaptureFunction(blogNotif.resource.uri).blogId;
      if (!blogId) return { managed: 0 };
      const session = getUserSession();
      const blogInfo = await blogService.get(session, blogId);
      if (!blogInfo) return { managed: 0 };
      mainNavNavigate(computeRelativePath(`${moduleConfig.routeName}/posts`, navState), {
        selectedBlog: blogInfo,
      });
      return {
        managed: 1,
        trackInfo: { action: 'Blog', name: `${notification.type}.${notification['event-type']}` },
      };
    } catch (e) {
      return { managed: 0 };
    }
  };

export default () =>
  registerNotifHandlers([
    {
      type: 'BLOG',
      'event-type': ['PUBLISH-POST', 'SUBMIT-POST', 'PUBLISH-COMMENT'],
      notifHandlerAction: handleBlogPostNotificationAction,
    },
    {
      type: 'BLOG',
      'event-type': 'SHARE',
      notifHandlerAction: handleBlogNotificationAction,
    },
  ]);
