import { CommonActions } from '@react-navigation/native';

import timelineModuleConfig from '~/framework/modules/timeline/module-config';
import { wikiRouteNames } from '~/framework/modules/wiki/navigation';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { getAsResourceUriNotification } from '~/framework/util/notifications';
import {
  handleNotificationNavigationAction,
  NotifHandlerThunkAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

const WIKI_ID_REGEX = /\/wiki\/id\/([a-f0-9\-]+)/i;
const PAGE_ID_REGEX = /\/page\/([a-f0-9\-]+)/i;

const handleWikiNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  try {
    const wikiNotif = getAsResourceUriNotification(notification);
    if (!wikiNotif) return { managed: 0 };

    const wikiUri = wikiNotif?.resource.uri;
    const wikiId = wikiUri?.match(WIKI_ID_REGEX)?.[1];
    if (!wikiId) return { managed: 0 };

    const navAction = CommonActions.navigate({
      name: computeTabRouteName(timelineModuleConfig.routeName),
      params: {
        initial: false,
        params: {
          notification: wikiNotif,
          resourceId: wikiId,
        },
        screen: wikiRouteNames.summary,
      },
    });

    handleNotificationNavigationAction(navAction);

    return {
      managed: 1,
      trackInfo: { action: 'Wiki', name: `${notification.type}.${notification['event-type']}` },
    };
  } catch {
    return { managed: 0 };
  }
};

const handlePageNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  try {
    const wikiNotif = getAsResourceUriNotification(notification);
    if (!wikiNotif) return { managed: 0 };

    const wikiUri = wikiNotif?.resource.uri;
    const wikiId = wikiUri?.match(WIKI_ID_REGEX)?.[1];
    if (!wikiId) return { managed: 0 };

    const pageId = wikiUri?.match(PAGE_ID_REGEX)?.[1];
    if (!pageId) return { managed: 0 };

    const navAction = CommonActions.navigate({
      name: computeTabRouteName(timelineModuleConfig.routeName),
      params: {
        initial: false,
        params: {
          notification: wikiNotif,
          pageId: pageId,
          resourceId: wikiId,
        },
        screen: wikiRouteNames.reader,
      },
    });

    handleNotificationNavigationAction(navAction);

    return {
      managed: 1,
      trackInfo: { action: 'Wiki', name: `${notification.type}.${notification['event-type']}` },
    };
  } catch {
    return { managed: 0 };
  }
};

export default () =>
  registerNotifHandlers([
    {
      'event-type': ['SHARED', 'PAGE-DELETED'],
      'notifHandlerAction': handleWikiNotificationAction,
      'type': 'WIKI',
    },
    {
      'event-type': ['PAGE-UPDATED', 'PAGE-CREATED', 'PAGE-VISIBLE'],
      'notifHandlerAction': handlePageNotificationAction,
      'type': 'WIKI',
    },
  ]);
