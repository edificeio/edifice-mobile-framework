import { InvitationClient, InvitationStatus } from '@edifice.io/community-client-rest-rn';
import { CommonActions } from '@react-navigation/native';

import moduleConfig from './module-config';
import { communitiesRouteNames } from './navigation';

import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { getAsResourceIdNotification, getAsResourceUriNotification, IAbstractNotification } from '~/framework/util/notifications';
import {
  handleNotificationNavigationAction,
  NotifHandlerThunkAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';
import { sessionApi } from '~/framework/util/transport';

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

const communityTabNavigate = (allowSwitchTab: string | false, { name, params }: { name: string; params?: object }) => {
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
  );
};

const handleCommunityUrlNotificationAction: NotifHandlerThunkAction = (notification, allowSwitchTab) => async () => {
  try {
    const { communityId } = extractCommunityInfoFromUrl(notification);

    if (communityId === undefined) throw new Error('No communityId in notification data');
    communityTabNavigate(allowSwitchTab, {
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

const handleCommunityInvitationNotificationAction: NotifHandlerThunkAction = (notification, allowSwitchTab) => async () => {
  try {
    const { communityId } = extractCommunityInfoFromId(notification);
    let invitationId =
      notification.backupData['sub-resource'] !== undefined ? parseInt(notification.backupData['sub-resource'], 10) : undefined;
    if (invitationId !== undefined && isNaN(invitationId)) invitationId = undefined;

    if (communityId === undefined || invitationId === undefined)
      throw new Error('No communityId or invitationId in notification data');

    // If community invitation has already been accepted, we must navigate to the home screen of it.
    const isAccepted = await sessionApi(moduleConfig, InvitationClient)
      .getInvitationById(invitationId)
      .then(data => data.status === InvitationStatus.ACCEPTED || data.status === InvitationStatus.REQUEST_ACCEPTED)
      .catch(() => undefined);

    communityTabNavigate(
      allowSwitchTab,
      isAccepted === undefined
        ? {
            name: communitiesRouteNames.list,
          }
        : isAccepted
          ? {
              name: communitiesRouteNames.home,
              params: { communityId, invitationId },
            }
          : {
              name: communitiesRouteNames.list,
              params: { pending: true },
            },
    );

    return {
      managed: 1,
      trackInfo: { action: 'Communities', name: `${notification.type}.${notification['event-type']}` },
    };
  } catch (e) {
    console.error(e);
    return { managed: 0 };
  }
};

const handleCommunityIdNotificationAction: NotifHandlerThunkAction = (notification, allowSwitchTab) => async () => {
  try {
    const { communityId } = extractCommunityInfoFromId(notification);
    if (communityId === undefined) throw new Error('No communityId in notification data');

    communityTabNavigate(allowSwitchTab, {
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
    {
      'event-type': ['JOIN_REQUEST_NEW', 'JOIN_REQUEST_PENDING', 'JOIN_REQUEST_ACCEPTED', 'JOIN_REQUEST_REJECTED'],
      'notifHandlerAction': handleCommunityIdNotificationAction,
      'type': 'COMMUNITIES',
    },
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
