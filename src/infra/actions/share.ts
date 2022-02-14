import { Platform } from 'react-native';
import Share from 'react-native-share';
import { ThunkDispatch } from 'redux-thunk';

import { startDownload, getExtension } from './downloadHelper';

import { Trackers } from '~/framework/util/tracker';
import { newDownloadAction } from '~/workspace/actions/download';
import { IFile } from '~/workspace/types/states';

export const share = async (downloadable: IFile) => {
  const res = await startDownload(downloadable, false, false);
  const path = res.path();
  const mime = downloadable.contentType;

  await Share.open({
    type: mime || 'text/html',
    url: Platform.OS === 'android' ? 'file://' + path : path,
    showAppsToView: true,
  });

  Trackers.trackEvent('Workspace', 'SHARE TO', getExtension(downloadable.filename));
};

export const shareAction = (downloadable: IFile) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  dispatch(
    newDownloadAction('', { item: downloadable }, async file => {
      await Share.open({
        type: file.filetype || 'text/html',
        url: Platform.OS === 'android' ? 'file://' + file.filepath : file.filepath,
        showAppsToView: true,
      });
    }),
  );
};
