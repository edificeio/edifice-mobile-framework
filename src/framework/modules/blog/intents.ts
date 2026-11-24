/**
 * What `blog` opens when it is asked from elsewhere (`intents` of its config): its resources and its notifications.
 */
import { type ConfigForIntents, notificationIntent } from '~/app/module';
import { blogUriCaptureFunction } from '~/framework/modules/blog/service/resource-uri';
import { getAsResourceUriNotification } from '~/framework/util/notifications';

export const intents: ConfigForIntents = {
  notification: [
    notificationIntent({
      callback: (notification, navigation) => {
        try {
          const blogNotif = getAsResourceUriNotification(notification);
          if (!blogNotif) return false;
          const { blogId, postId } = blogUriCaptureFunction(blogNotif.resource.uri);
          if (!blogId || !postId) return false;
          navigation.navigate('blog/blog-post-details', { blogId, postId });
          return true;
        } catch {
          return false;
        }
      },
      eventType: ['PUBLISH-POST', 'SUBMIT-POST', 'PUBLISH-COMMENT'],
      type: 'BLOG',
    }),
    notificationIntent({
      callback: (notification, navigation) => {
        try {
          const blogNotif = getAsResourceUriNotification(notification);
          if (!blogNotif) return false;
          const blogId = blogUriCaptureFunction(blogNotif.resource.uri).blogId;
          if (!blogId) return false;
          navigation.navigate('blog/list', { blogId });
          return true;
        } catch {
          return false;
        }
      },
      eventType: 'SHARE',
      type: 'BLOG',
    }),
  ],
  resource: [
    {
      callback: (resource, navigation) => {
        navigation.push('blog/list', { blogId: resource.resourceId });
        return true;
      },
      resourceType: 'blog',
    },
  ],
};
