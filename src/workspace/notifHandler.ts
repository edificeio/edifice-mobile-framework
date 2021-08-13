import I18n from 'i18n-js';
import Conf from '../../ode-framework-conf';
import { mainNavNavigate } from '../navigation/helpers/navHelper';
import { NotificationHandlerFactory } from '../infra/pushNotification';
import { FilterId, IFile } from './types';
import { Trackers } from '../infra/tracker';

const notifHandlerFactory: NotificationHandlerFactory<any, any, any> = () => async (notificationData, apps, trackCategory) => {
  if (!notificationData?.resourceUri?.startsWith('/workspace')) {
    return false;
  }
  const split = notificationData.resourceUri.split('/');
  const parentId = split[split.length - 1];

  if (!Conf.currentPlatform) {
    throw new Error('must specify a platform');
  }

  const name = (notificationData as any).resourceName;
  const isFolder = notificationData.resourceUri.indexOf('/folder/') > 0;

  if (isFolder) {
    mainNavNavigate('Workspace', {
      filter: FilterId.root,
      parentId: FilterId.root,
      title: I18n.t('workspace'),
      childRoute: 'Workspace',
      childParams: { parentId, filter: FilterId.shared, title: name },
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
      filter: FilterId.root,
      parentId: FilterId.root,
      title: I18n.t('workspace'),
      childRoute: 'WorkspaceDetails',
      childParams: { item, title: name },
    });
  }

  trackCategory && Trackers.trackEvent(trackCategory, 'Workspace', '/workspace');

  return true;
};

export default notifHandlerFactory;
