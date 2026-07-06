import { CommonActions, NavigationProp, ParamListBase } from '@react-navigation/native';

import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { getAsResourceIdNotification, getAsResourceUriNotification, IAbstractNotification } from '~/framework/util/notifications';
import {
  handleNotificationNavigationAction,
  NotifHandlerThunkAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

import moduleConfig from './module-config';
import { communitiesRouteNames } from './navigation';

const COMMUNITY_ID_REGEX = /\/communities\/id\/([a-f0-9-]+)/i;

const extractCommunityInfoFromUrl = (notification: IAbstractNotification) => {
  const communityNotif = getAsResourceUriNotification(notification);
  if (!communityNotif) return {};
  const communityIdStr = communityNotif.resource.uri.match(COMMUNITY_ID_REGEX)?.[1];
  let communityIdInt = communityIdStr !== undefined ? parseInt(communityIdStr, 10) : undefined;
  if (communityIdInt !== undefined && isNaN(communityIdInt)) communityIdInt = undefined;
  return { communityId: communityIdInt };
};

const extractCommunityInfoFromId = (notification: IAbstractNotification) => {
  const communityNotif = getAsResourceIdNotification(notification);
  if (!communityNotif) return {};
  let communityIdInt = parseInt(communityNotif.resource.id, 10);
  return { communityId: isNaN(communityIdInt) ? undefined : communityIdInt };
};

const communityTabNavigate = (
  navigation: NavigationProp<ParamListBase>,
  dispatch: NavigationProp<ParamListBase>['dispatch'],
  allowSwitchTab: string | false,
  { name, params }: { name: string; params?: object },
) => {
  handleNotificationNavigationAction(
    CommonActions.navigate(
      allowSwitchTab
        ? {
            name: computeTabRouteName(moduleConfig.routeName),
            params: {
              initial: false,
              params,
              screen: name,
            },
          }
        : {
            name,
            params,
          },
    ),
    navigation,
    dispatch,
  );
};

const handleCommunityUrlNotificationAction: NotifHandlerThunkAction =
  (notification, allowSwitchTab, navigation, dispatch) => async () => {
    try {
      const { communityId } = extractCommunityInfoFromUrl(notification);

      if (communityId === undefined) throw new Error('No communityId in notification data');
      communityTabNavigate(navigation, dispatch, allowSwitchTab, {
        name: communitiesRouteNames.home,
        params: {
          communityId,
        },
      });
      return {
        managed: 1,
        trackInfo: { action: 'Communities', name: `${notification.type}.${notification['event-type']}` },
      };
    } catch (e) {
      console.error(e);
      return { managed: 0 };
    }
  };

const handleCommunityInvitationNotificationAction: NotifHandlerThunkAction =
  (notification, allowSwitchTab, navigation, dispatch) => async () => {
    try {
      communityTabNavigate(navigation, dispatch, allowSwitchTab, {
        name: communitiesRouteNames.list,
      });

      return {
        managed: 1,
        trackInfo: { action: 'Communities', name: `${notification.type}.${notification['event-type']}` },
      };
    } catch (e) {
      console.error(e);
      return { managed: 0 };
    }
  };

const handleCommunityIdNotificationAction: NotifHandlerThunkAction =
  (notification, allowSwitchTab, navigation, dispatch) => async () => {
    try {
      const { communityId } = extractCommunityInfoFromId(notification);
      if (communityId === undefined) throw new Error('No communityId in notification data');

      communityTabNavigate(navigation, dispatch, allowSwitchTab, {
        name: communitiesRouteNames.home,
        params: {
          communityId,
        },
      });

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
    // Note: Until we can accept invitations on mobile, these events are web-redirected.
    // {
    //   'event-type': ['JOIN_REQUEST_NEW', 'JOIN_REQUEST_PENDING', 'JOIN_REQUEST_ACCEPTED', 'JOIN_REQUEST_REJECTED'],
    //   'notifHandlerAction': handleCommunityIdNotificationAction,
    //   'type': 'COMMUNITIES',
    // },
    {
      'event-type': ['ADD_MEMBER'],
      'notifHandlerAction': handleCommunityInvitationNotificationAction,
      'type': 'COMMUNITIES',
    },
    {
      'event-type': ['ANNOUNCEMENT_NEW', 'RESOURCE_NEW', 'COURSE_PAGE_NEW', 'DISCUSSION_MESSAGE_NEW'],
      'notifHandlerAction': handleCommunityUrlNotificationAction,
      'type': 'COMMUNITIES',
    },
  ]);
