/**
 * Workspace notif handler
 */
import { StackActions } from '@react-navigation/native';
import I18n from 'i18n-js';

import timelineModuleConfig from '~/framework/modules/timelinev2/moduleConfig';
import { navigate, navigationRef } from '~/framework/navigation/helper';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';

import { WorkspaceNavigationParams, workspaceRouteNames } from './navigation';
import { Filter } from './reducer';

const handleWorkspaceShareFolderNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  const resourceUri = notification.backupData.params.resourceUri;
  if (!resourceUri) return { managed: 0 };
  const index = resourceUri.indexOf('folder/');
  if (index === -1) return { managed: 0 };
  const parentId = resourceUri.substring(index + 7);

  navigationRef.dispatch(StackActions.popToTop());
  navigate(computeTabRouteName(timelineModuleConfig.routeName), {
    initial: false,
    screen: workspaceRouteNames.home,
    params: {
      filter: Filter.SHARED,
      parentId,
      title: notification.backupData.params.resourceName ?? '',
    },
  });

  return {
    managed: 1,
    trackInfo: { action: 'Workspace', name: `${notification.type}.${notification['event-type']}` },
  };
};

const handleWorkspaceShareNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  const folderUri = notification.backupData.params.resourceFolderUri;
  if (!folderUri) return { managed: 0 };
  const index = folderUri.indexOf('folder/');
  const parentId = index > 0 ? folderUri.substring(index + 7) : 'shared';
  const title =
    notification.backupData.params.resourceFolderName === 'Documents personnels'
      ? I18n.t('shared')
      : notification.backupData.params.resourceFolderName;

  navigationRef.dispatch(StackActions.popToTop());
  navigate(computeTabRouteName(timelineModuleConfig.routeName), {
    initial: false,
    screen: workspaceRouteNames.home,
    params: {
      filter: Filter.SHARED,
      parentId,
      title,
    },
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
      'event-type': ['SHARE-FOLDER', 'CONTRIB-FOLDER'],
      notifHandlerAction: handleWorkspaceShareFolderNotificationAction,
    },
    {
      type: 'WORKSPACE',
      'event-type': 'SHARE',
      notifHandlerAction: handleWorkspaceShareNotificationAction,
    },
  ]);
