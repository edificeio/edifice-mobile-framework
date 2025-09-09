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

const COMMUNITY_ID_REGEX = /\/community\/id\/([a-f0-9-]+)/i;

const handleCommunitiesNotificationAction: NotifHandlerThunkAction =
  (notification, allowSwitchTab) => async (dispatch, getState) => {
    try {
      const communityNotif = getAsResourceUriNotification(notification);
      if (!communityNotif) return { managed: 0 };

      const communityUri = communityNotif?.resource.uri;
      const communityId = communityUri?.match(COMMUNITY_ID_REGEX)?.[1];
      if (!communityId) return { managed: 0 };

      const navAction = CommonActions.navigate(
        allowSwitchTab
          ? {
              name: computeTabRouteName(timelineModuleConfig.routeName),
              params: {
                initial: false,
                params: {
                  fromTimeline: false,
                  notification: communityNotif,
                  resourceId: communityId,
                },
                screen: communitiesRouteNames.home,
              },
            }
          : {
              name: communitiesRouteNames.home,
              params: {
                fromTimeline: true,
                id: communityId,
                notification: communityNotif,
              },
            },
      );

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
      'event-type': [
        'add_member',
        'announcement_new',
        'course_page_new',
        'discussion_message_new',
        'join_request_new',
        'join_request_pending',
        'join_request_accepted',
        'join_request_rejected',
        'resource_new',
      ],
      'notifHandlerAction': handleCommunitiesNotificationAction,
      'type': 'communities',
    },
  ]);
