/**
 * Workspace notif handler
 */
import I18n from 'i18n-js';

import { computeRelativePath } from '~/framework/util/navigation';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';

import moduleConfig from './moduleConfig';
import { Filter } from './reducer';

const handleWorkspaceShareFolderNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navState) => async (dispatch, getState) => {
    const resourceUri = notification.backupData.params.resourceUri;
    if (!resourceUri) return { managed: 0 };
    const index = resourceUri.indexOf('folder/');
    if (index === -1) return { managed: 0 };
    const parentId = resourceUri.substring(index + 7);
    mainNavNavigate(computeRelativePath(moduleConfig.routeName, navState), {
      filter: Filter.SHARED,
      parentId,
      title: notification.backupData.params.resourceName,
    });
    return {
      managed: 1,
      trackInfo: { action: 'Workspace', name: `${notification.type}.${notification['event-type']}` },
    };
  };

const handleWorkspaceShareNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navState) => async (dispatch, getState) => {
    const folderUri = notification.backupData.params.resourceFolderUri;
    if (!folderUri) return { managed: 0 };
    const index = folderUri.indexOf('folder/');
    const parentId = index > 0 ? folderUri.substring(index + 7) : 'shared';
    const title =
      notification.backupData.params.resourceFolderName === 'Documents personnels'
        ? I18n.t('shared')
        : notification.backupData.params.resourceFolderName;
    mainNavNavigate(computeRelativePath(moduleConfig.routeName, navState), {
      filter: Filter.SHARED,
      parentId,
      title,
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
