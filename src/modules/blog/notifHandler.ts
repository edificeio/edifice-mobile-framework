/**
 * Blog notif handler
 */

import moduleConfig from './moduleConfig';

import { computeRelativePath } from '~/framework/util/navigation';
import { getAsResourceUriNotification, IResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';
import { blogService, blogUriCaptureFunction } from './service';
import { getUserSession } from '~/framework/util/session';
import { IBlogPostWithComments } from './reducer';

export interface IBlogNotification extends ITimelineNotification, IResourceUriNotification {}

const handleBlogPostNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navState) => async (dispatch, getState) => {
    const path = computeRelativePath(`${moduleConfig.routeName}/details`, navState);
    const useNotification = path !== `${moduleConfig.routeName}/details`;
    const navParams = {};
    if (!useNotification) {
      const blogNotif = getAsResourceUriNotification(notification);
      if (!blogNotif) return { managed: 0 };
      const blogIds = blogUriCaptureFunction(blogNotif.resource.uri);
      if (!blogIds.blogId || !blogIds.postId) return { managed: 0 };
      const session = getUserSession(getState());
      const { blogId, postId } = blogIds;
      const blogPostInfo = await blogService.post.get(session, { blogId, postId });
      const blogPostComments = await blogService.comments.get(session, { blogId, postId });
      const blogPostData: IBlogPostWithComments = { ...blogPostInfo, comments: blogPostComments };
      navParams['blogPostWithComments'] = blogPostData;
      navParams['blogId'] = blogId;
      console.log('navParams', navParams);
    }
    mainNavNavigate(path, {
      notification,
      useNotification,
      ...navParams
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
      const session = getUserSession(getState());
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
      console.warn(e);
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
