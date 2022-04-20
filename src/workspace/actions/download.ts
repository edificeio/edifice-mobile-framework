import I18n from 'i18n-js';
import Toast from 'react-native-tiny-toast';
import { ThunkDispatch } from 'redux-thunk';

import { IDistantFile, SyncedFile } from '~/framework/util/fileHandler';
import fileTransferService from '~/framework/util/fileHandler/service';
import { getUserSession } from '~/framework/util/session';
import { Trackers } from '~/framework/util/tracker';
import { asyncActionRawFactory } from '~/infra/actions/asyncActionFactory';
import { downloadFiles, getExtension } from '~/infra/actions/downloadHelper';
import { asyncActionTypes } from '~/infra/redux/async';
import config from '~/workspace/config';
import { IFile, IItems } from '~/workspace/types';

export const actionTypesDownload = asyncActionTypes(config.createActionType('/workspace/download'));

export function downloadAction(parentId: string, selected: IItems<IFile>) {
  return asyncActionRawFactory(actionTypesDownload, { parentId }, async () => {
    downloadFiles(Object.values(selected));
    return {};
  });
}

export const convertIFileToIDistantFile = (file: IFile) => {
  return {
    url: file.url,
    filename: file.name,
    filesize: file.size,
    filetype: file.contentType,
  } as IDistantFile;
};

export const newDownloadThenOpenAction = (parentId: string, selected: IItems<IFile>) =>
  newDownloadAction(parentId, selected, f => f.open());

export const newDownloadAction =
  (parentId: string, selected: IItems<IFile>, callback: (f: SyncedFile) => void) =>
  async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    return dispatch(
      asyncActionRawFactory(actionTypesDownload, { parentId }, async () => {
        const ret = [] as Promise<void>[];
        for (const k in selected) {
          const sel = selected[k];
          if (sel.url.startsWith('/zimbra')) {
            Trackers.trackEvent('Zimbra', 'DOWNLOAD ATTACHMENT');
          } else {
            Trackers.trackEvent('Workspace', 'DOWNLOAD', getExtension(sel.filename));
          }
          ret.push(
            fileTransferService
              .downloadFile(
                getUserSession(),
                convertIFileToIDistantFile(sel),
                {},
                {
                  onProgress: res => console.debug('progress', res.bytesWritten / res.contentLength),
                },
              )
              .then(callback),
          );
        }
        return ret;
      }),
    );
  };

export const downloadAndSaveAction =
  (downloadable: IItems<IFile>) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      dispatch(
        newDownloadAction('', downloadable, async file => {
          await file.mirrorToDownloadFolder();
          Toast.showSuccess(I18n.t('download-success-name', { name: file.filename }));
        }),
      );
    } catch (e) {
      Toast.show(I18n.t('download-error-generic'));
    }
  };
