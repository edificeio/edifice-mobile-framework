/**
 * Workspace notif handler
 */
import { CommonActions } from '@react-navigation/native';

import { workspaceRouteNames } from './navigation';
import { Filter } from './reducer';

import { I18n } from '~/app/i18n';
import timelineModuleConfig from '~/framework/modules/timeline/module-config';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import {
  handleNotificationNavigationAction,
  NotifHandlerThunkAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

const handleWorkspaceShareFolderNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navigation) => async (dispatch, getState) => {
    try {
      // 1. Get notification data
      const resourceUri = notification.backupData.params.resourceUri;
      if (!resourceUri) return { managed: 0 };
      const index = resourceUri.indexOf('folder/');
      if (index === -1) return { managed: 0 };
      const parentId = resourceUri.substring(index + 7);

      // 2. actual navigation action
      const navAction = CommonActions.navigate({
        name: computeTabRouteName(timelineModuleConfig.routeName),
        params: {
          initial: false,
          params: {
            filter: Filter.SHARED,
            parentId,
            title: notification.backupData.params.resourceName ?? '',
          },
          screen: workspaceRouteNames.home,
        },
      });

      // 3. Go !
      handleNotificationNavigationAction(navAction);

      // 4. Return notif handling result
      return {
        managed: 1,
        trackInfo: { action: 'Workspace', name: `${notification.type}.${notification['event-type']}` },
      };
    } catch {
      return { managed: 0 };
    }
  };

const handleWorkspaceShareNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navigation) => async (dispatch, getState) => {
    try {
      // 1. Get notification data
      const folderUri = notification.backupData.params.resourceFolderUri;
      if (!folderUri) return { managed: 0 };
      const index = folderUri.indexOf('folder/');
      const parentId = index > 0 ? folderUri.substring(index + 7) : 'shared';
      const title =
        notification.backupData.params.resourceFolderName === 'Documents personnels'
          ? I18n.get('workspace-filelist-shared')
          : notification.backupData.params.resourceFolderName;

      // 2. actual navigation action
      const navAction = CommonActions.navigate({
        name: computeTabRouteName(timelineModuleConfig.routeName),
        params: {
          initial: false,
          params: {
            filter: Filter.SHARED,
            parentId,
            title,
          },
          screen: workspaceRouteNames.home,
        },
      });

      // 3. Go !
      handleNotificationNavigationAction(navAction);

      // 4. Return notif handling result
      return {
        managed: 1,
        trackInfo: { action: 'Workspace', name: `${notification.type}.${notification['event-type']}` },
      };
    } catch {
      return { managed: 0 };
    }
  };

export default () =>
  registerNotifHandlers([
    {
      'event-type': ['SHARE-FOLDER', 'CONTRIB-FOLDER'],
      notifHandlerAction: handleWorkspaceShareFolderNotificationAction,
      type: 'WORKSPACE',
    },
    {
      'event-type': 'SHARE',
      notifHandlerAction: handleWorkspaceShareNotificationAction,
      type: 'WORKSPACE',
    },
  ]);
