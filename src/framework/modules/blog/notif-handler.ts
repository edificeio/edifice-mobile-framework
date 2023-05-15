/**
 * Blog notif handler
 * @scaffolder Remove this file if your module handles no notification.
 *
 * The notifHandler registers some behaviours for given notif types and event-types.
 * It applicates to both timelineNotififation and pushNotifications.
 */
import { CommonActions } from '@react-navigation/native';

import { assertSession } from '~/framework/modules/auth/reducer';
import { blogRouteNames } from '~/framework/modules/blog/navigation';
import { blogService, blogUriCaptureFunction } from '~/framework/modules/blog/service';
import timelineModuleConfig from '~/framework/modules/timeline/module-config';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { getAsResourceUriNotification } from '~/framework/util/notifications';
import {
  NotifHandlerThunkAction,
  handleNotificationNavigationAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

const handleBlogPostNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navigation) => async (dispatch, getState) => {
    try {
      const blogNotif = getAsResourceUriNotification(notification);
      if (!blogNotif) return { managed: 0 };

      const navAction = CommonActions.navigate({
        name: computeTabRouteName(timelineModuleConfig.routeName),
        params: {
          initial: false,
          screen: blogRouteNames.blogPostDetails,
          params: {
            notification: blogNotif,
            useNotification: true,
          },
        },
      });

      handleNotificationNavigationAction(navAction);

      return {
        managed: 1,
        trackInfo: { action: 'Blog', name: `${notification.type}.${notification['event-type']}` },
      };
    } catch {
      return { managed: 0 };
    }
  };

const handleBlogNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navigation) => async (dispatch, getState) => {
    try {
      // 0. Get notification data
      const blogNotif = getAsResourceUriNotification(notification);
      if (!blogNotif) return { managed: 0 };
      const blogId = blogUriCaptureFunction(blogNotif.resource.uri).blogId;
      if (!blogId) return { managed: 0 };
      const session = assertSession();
      const blogInfo = await blogService.get(session, blogId);
      if (!blogInfo) return { managed: 0 };

      const navAction = CommonActions.navigate({
        name: computeTabRouteName(timelineModuleConfig.routeName),
        params: {
          initial: false,
          screen: blogRouteNames.blogPostList,
          params: {
            selectedBlog: blogInfo,
          },
        },
      });

      handleNotificationNavigationAction(navAction);

      // 4. Return notif handling result
      return {
        managed: 1,
        trackInfo: { action: 'Blog', name: `${notification.type}.${notification['event-type']}` },
      };
    } catch {
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
