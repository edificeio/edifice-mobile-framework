import { CommunityClient } from '@edifice.io/community-client-rest-rn';
import { CommonActions } from '@react-navigation/native';

import moduleConfig from './module-config';
import { communitiesRouteNames } from './navigation';

import timelineModuleConfig from '~/framework/modules/timeline/module-config';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { getAsNamedResourceNotification, getAsResourceUriNotification } from '~/framework/util/notifications';
import {
  handleNotificationNavigationAction,
  NotifHandlerThunkAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';
import { sessionApi } from '~/framework/util/transport';

const COMMUNITY_ID_REGEX = /\/community\/id\/([a-f0-9-]+)/i;

const handleCommunitiesInvitationNotificationAction: NotifHandlerThunkAction =
  (notification, allowSwitchTab) => async (dispatch, getState) => {
    try {
      const communityNotif = getAsNamedResourceNotification(notification);
      if (!communityNotif) return { managed: 0 };

      // If community invitation has already been accepted, we must navigate to the home screen of it.
      const resource = await sessionApi(moduleConfig, CommunityClient)
        .getCommunity(parseInt(communityNotif.resource.id, 10))
        .catch(() => null);

      if (resource !== null) {
        handleNotificationNavigationAction(
          CommonActions.navigate(
            allowSwitchTab
              ? {
                  name: computeTabRouteName(moduleConfig.routeName),
                  params: {
                    initial: false,
                    params: {
                      communityId: resource.id,
                    },
                    screen: communitiesRouteNames.home,
                  },
                }
              : {
                  name: communitiesRouteNames.home,
                  params: {
                    communityId: resource.id,
                  },
                },
          ),
        );
      } else {
        handleNotificationNavigationAction(
          CommonActions.navigate(
            allowSwitchTab
              ? {
                  name: computeTabRouteName(moduleConfig.routeName),
                  params: {
                    initial: false,
                    params: {
                      pending: true,
                    },
                    screen: communitiesRouteNames.list,
                  },
                }
              : {
                  name: communitiesRouteNames.list,
                  params: {
                    pending: true,
                  },
                },
          ),
        );
      }
      return {
        managed: 1,
        trackInfo: { action: 'Communities', name: `${notification.type}.${notification['event-type']}` },
      };
    } catch {
      return { managed: 0 };
    }
  };

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
        'ANNOUNCEMENT_NEW',
        'COURSE_PAGE_NEW',
        'DISCUSSION_MESSAGE_NEW',
        'JOIN_REQUEST_NEW',
        'JOIN_REQUEST_PENDING',
        'JOIN_REQUEST_ACCEPTED',
        'JOIN_REQUEST_REJECTED',
        'RESOURCE_NEW',
      ],
      'notifHandlerAction': handleCommunitiesNotificationAction,
      'type': 'COMMUNITIES',
    },
    {
      'event-type': ['ADD_MEMBER'],
      'notifHandlerAction': handleCommunitiesInvitationNotificationAction,
      'type': 'COMMUNITIES',
    },
  ]);
