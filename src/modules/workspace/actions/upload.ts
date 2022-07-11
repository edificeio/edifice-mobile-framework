import getPath from '@flyerhq/react-native-android-uri-path';
import I18n from 'i18n-js';
import { Platform } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { ThunkDispatch } from 'redux-thunk';

import workspaceService, { IWorkspaceUploadParams } from '~/framework/modules/workspace/service';
import { LocalFile } from '~/framework/util/fileHandler';
import { createAsyncActionCreators } from '~/framework/util/redux/async';
import { getUserSession } from '~/framework/util/session';
import { progressAction, progressEndAction, progressInitAction } from '~/infra/actions/progress';
import { actionTypes } from '~/modules/workspace/reducer';
import { ContentUri } from '~/types/contentUri';

const uploadFiles =
  (parentId: string, content: ContentUri[]) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      const lcs = content.map(
        c =>
          new LocalFile(
            {
              filepath: c.uri,
              filename: c.name,
              filetype: c.mime,
            },
            { _needIOSReleaseSecureAccess: false },
          ),
      );
      const jobs = workspaceService.startUploadFiles(
        getUserSession(),
        lcs,
        { parent: parentId as IWorkspaceUploadParams['parent'] },
        {
          onBegin: res => {
            dispatch(progressInitAction());
          },
          onProgress: res => {
            dispatch(progressAction((res.totalBytesSent / res.totalBytesExpectedToSend) * 100));
          },
        },
      );
      return await Promise.all(jobs.map(j => j.promise)).then(files => {
        dispatch(progressAction(100));
        dispatch(progressEndAction());
        return files;
      });
    } catch (e) {
      if (e && e?.response && e.response.body === `{"error":"file.too.large"}`) {
        Toast.show(I18n.t('workspace.quota.overflowText'));
      }
    }
  };

/**
 * Take a file from the mobile and post it to the backend.
 */
export const workspaceUploadActionsCreators = createAsyncActionCreators(actionTypes.upload);
export const uploadWorkspaceFilesAction =
  (parentId: string, uriContent: ContentUri[] | ContentUri) => async (dispatch, getState) => {
    try {
      uriContent = Array.isArray(uriContent) ? uriContent : [uriContent];
      for (const content of uriContent) {
        content.uri = Platform.select({
          android: getPath(content.uri),
          default: decodeURI(content.uri.indexOf('file://') > -1 ? content.uri.split('file://')[1] : content.uri),
        });
      }
      dispatch(workspaceUploadActionsCreators.request());
      const files = await dispatch(uploadFiles(parentId, uriContent));
      dispatch(workspaceUploadActionsCreators.receipt(files));
    } catch (e) {
      dispatch(workspaceUploadActionsCreators.error(e as Error));
    }
  };
