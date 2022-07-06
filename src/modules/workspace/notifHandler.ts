import I18n from 'i18n-js';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { Trackers } from '~/framework/util/tracker';
import { NotificationHandlerFactory } from '~/infra/pushNotification';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';

import { Filter, IFile } from './types';

const notifHandlerFactory: NotificationHandlerFactory<any, any, any> = () => async (notificationData, apps, trackCategory) => {
  if (!notificationData?.resourceUri?.startsWith('/workspace')) {
    return false;
  }
  const split = notificationData.resourceUri.split('/');
  const parentId = split[split.length - 1];

  if (!DEPRECATED_getCurrentPlatform()) {
    throw new Error('must specify a platform');
  }

  const name = (notificationData as any).resourceName;
  const isFolder = notificationData.resourceUri.indexOf('/folder/') > 0;

  if (isFolder) {
    mainNavNavigate('Workspace', {
      filter: Filter.ROOT,
      parentId: Filter.ROOT,
      title: I18n.t('workspace.tabName'),
      childRoute: 'Workspace',
      childParams: { parentId, filter: Filter.SHARED, title: name },
    });
  } else {
    const item: IFile = {
      contentType: 'plain/text',
      date: Date.now(),
      id: parentId,
      isFolder: false,
      name,
      filename: name,
      owner: '',
      ownerName: '',
      size: 0,
      url: `/workspace/document/${parentId}`,
    };
    mainNavNavigate('Workspace', {
      filter: Filter.ROOT,
      parentId: Filter.ROOT,
      title: I18n.t('workspace.tabName'),
      childRoute: 'WorkspaceDetails',
      childParams: { item, title: name },
    });
  }

  trackCategory && Trackers.trackEvent(trackCategory, 'Workspace', '/workspace');

  return true;
};

export default notifHandlerFactory;
