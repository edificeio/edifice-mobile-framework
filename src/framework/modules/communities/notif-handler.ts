import { CommonActions } from '@react-navigation/native';

import { communitiesRouteNames } from './navigation';

import timelineModuleConfig from '~/framework/modules/timeline/module-config';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { getAsResourceUriNotification } from '~/framework/util/notifications';
import {
  handleNotificationNavigationAction,
  NotifHandlerThunkAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

const COMMUNITY_ID_REGEX = /\/community\/id\/([a-f0-9\-]+)/i;

const handleCommunitiesNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  try {
    const communityNotif = getAsResourceUriNotification(notification);
    if (!communityNotif) return { managed: 0 };

    const communityUri = communityNotif?.resource.uri;
    const communityId = communityUri?.match(COMMUNITY_ID_REGEX)?.[1];
    if (!communityId) return { managed: 0 };

    const navAction = CommonActions.navigate({
      name: computeTabRouteName(timelineModuleConfig.routeName),
      params: {
        initial: false,
        params: {
          notification: communityNotif,
          resourceId: communityId,
        },
        screen: communitiesRouteNames.home,
      },
    });

    handleNotificationNavigationAction(navAction);

    return {
      managed: 1,
      trackInfo: { action: 'Communities', name: `${notification.type}.${notification['event-type']}` },
    };
  } catch {
    return { managed: 0 };
  }
};

export default () =>
  registerNotifHandlers([
    {
      'event-type': ['add_member', 'join_request_new', 'join_request_pending', 'join_request_accepted'],
      'notifHandlerAction': handleCommunitiesNotificationAction,
      'type': 'communities',
    },
  ]);

// DOC NOTIF
// /**
//  * Community notification type prefix
//  */
// export const NOTIFICATION_TYPE = "communities";

// /**
//  * Notification event types for communities module
//  */
// export enum NOTIFICATION_EVENT {
//   // Member related notifications
//   COMMUNITY_ADD_MEMBER = "add_member",

//   // Announcements notifications
//   ANNOUNCEMENT_NEW = "announcement_new",

//   // Course related notifications
//   COURSE_PAGE_NEW = "course_page_new",

//   // Resource related notifications
//   RESOURCE_NEW = "resource_new",

//   // Discussion related notifications
//   DISCUSSION_MESSAGE_NEW = "discussion_message_new",

//   // Join request related notifications
//   JOIN_REQUEST_NEW = "join_request_new",
//   JOIN_REQUEST_PENDING = "join_request_pending",
//   JOIN_REQUEST_ACCEPTED = "join_request_accepted",
//   JOIN_REQUEST_REJECTED = "join_request_rejected",
// }

// /**
//  * Utility to generate notification full name
//  *
//  * @param event Event type for the notification
//  * @returns Full notification name (type.event_type format)
//  */
// export const getNotificationName = (event: NOTIFICATION_EVENT): string => {
//   return `${NOTIFICATION_TYPE}.${event}`;
// };
