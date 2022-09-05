/**
 * Workspace notif handler
 */
import { computeRelativePath } from '~/framework/util/navigation';
import { IAbstractNotification, getAsResourceUriNotification } from '~/framework/util/notifications';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';

import moduleConfig from './moduleConfig';
import { Filter } from './reducer';

interface IWorkspaceShareFolderNotification extends IAbstractNotification {
  resourceName: string;
}

interface IWorkspaceShareNotification extends IAbstractNotification {
  resourceFolderName: string;
  resourceFolderUri: string;
}

const handleWorkspaceShareFolderNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navState) => async (dispatch, getState) => {
    const workspaceNotif = getAsResourceUriNotification(notification);
    if (!workspaceNotif) return { managed: 0 };
    const index = workspaceNotif.resource.uri.indexOf('folder/');
    if (index === -1) return { managed: 0 };
    const parentId = workspaceNotif.resource.uri.substring(index + 7);
    mainNavNavigate(computeRelativePath(moduleConfig.routeName, navState), {
      filter: Filter.SHARED,
      parentId,
      title: (notification as IWorkspaceShareFolderNotification).resourceName,
      notification,
    });
    return {
      managed: 1,
      trackInfo: { action: 'Workspace', name: `${notification.type}.${notification['event-type']}` },
    };
  };

const handleWorkspaceShareNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navState) => async (dispatch, getState) => {
    const workspaceNotif = notification as IWorkspaceShareNotification;
    if (!workspaceNotif) return { managed: 0 };
    const index = workspaceNotif.resourceFolderUri.indexOf('folder/');
    const parentId = index > 0 ? workspaceNotif.resourceFolderUri.substring(index + 7) : 'shared';
    mainNavNavigate(computeRelativePath(moduleConfig.routeName, navState), {
      filter: Filter.SHARED,
      parentId,
      title: workspaceNotif.resourceFolderName,
      notification,
    });
    return {
      managed: 1,
      trackInfo: { action: 'Workspace', name: `${notification.type}.${notification['event-type']}` },
    };
  };

export default () =>
  registerNotifHandlers([
    {
      type: 'WORKSPACE',
      'event-type': 'SHARE-FOLDER',
      notifHandlerAction: handleWorkspaceShareFolderNotificationAction,
    },
    {
      type: 'WORKSPACE',
      'event-type': 'SHARE',
      notifHandlerAction: handleWorkspaceShareNotificationAction,
    },
  ]);
