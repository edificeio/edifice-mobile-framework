import Mime from 'mime';
import { PermissionsAndroid, Platform } from 'react-native';
import Permissions from 'react-native-permissions';

import Conf from '../../../ode-framework-conf';
import { IFile } from '../../workspace/types';
import { getAuthHeader } from '../oauth';
import { Trackers } from '../tracker';

export const downloadFiles = (downloadable: Array<IFile>, withManager = true) => {
  downloadable.map(document => downloadFile(document, withManager));
};

export const downloadFile = (downloadable: IFile, withManager = true) => {
  if (downloadable?.url?.startsWith('/zimbra')) {
    Trackers.trackEvent('Zimbra', 'DOWNLOAD ATTACHMENT');
    if (Platform.OS === 'ios') {
      startDownload(downloadable, withManager, false).then(res => openDownloadedFile(res.path()));
    } else {
      startDownload(downloadable, withManager, false);
    }
  } else {
    if (Platform.OS === 'ios') {
      startDownload(downloadable, withManager).then(res => openDownloadedFile(res.path()));
    } else {
      startDownload(downloadable, withManager);
    }
  }
};

export const startDownload = async (downloadable: IFile, withManager = true, doTrack: boolean = true): Promise<any> => {
  return null;
  /*let path = (await getDirName()) + '/' + downloadable.filename;

  const config =
    Platform.OS === 'android'
      ? {
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: withManager,
            mediaScannable: true,
            path,
          },
        }
      : {
          path,
          appendExt: getExtension(downloadable.filename),
        };

  doTrack && Trackers.trackEvent('Workspace', 'DOWNLOAD', getExtension(downloadable.filename));

  return RNFetchBlob.config(config).fetch('GET', (Conf.currentPlatform as any).url + downloadable.url, getAuthHeader());*/
};

export const openPreview = async (downloadable: IFile) => {
  const res = await downloadOnCache(downloadable);

  openDownloadedFile(res.path());
};

export const downloadOnCache = async (downloadable: IFile): Promise<any> => {
  return null;
  /*return await RNFetchBlob.config({
    fileCache: true,
    appendExt: getExtension(downloadable.filename),
  }).fetch('GET', (Conf.currentPlatform as any).url + downloadable.url, getAuthHeader());*/
};

export const openDownloadedFile = (filepath: string): void => {
  /*
  if (Platform.OS === 'ios') RNFetchBlob.ios.openDocument(filepath);
  else if (Platform.OS === 'android') {
    RNFetchBlob.android.actionViewIntent(filepath, Mime.getType(filepath) || 'text/html');
  } else console.warn('Cannot handle file for devices other than ios/android.');
  */
};

export const getDirName = async (): Promise<string> => {
  /*if (Platform.OS === 'android') {
    await Permissions.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    return RNFetchBlob.fs.dirs.DownloadDir;
  } else if (Platform.OS === 'ios') {
    return RNFetchBlob.fs.dirs.DocumentDir;
  }
  console.warn('Cannot handle file for devices other than ios/android.');*/
  return '';
};

export const getExtension = (filename: string): string => {
  return filename.substr(filename.lastIndexOf('.') + 1);
};
