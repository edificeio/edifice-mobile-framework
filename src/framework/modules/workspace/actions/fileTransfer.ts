import { ThunkDispatch } from 'redux-thunk';

import workspaceService, { IWorkspaceUploadParams } from '~/framework/modules/workspace/service';
import type { LocalFile } from '~/framework/util/fileHandler';
import type { IUploadCallbaks } from '~/framework/util/fileHandler/service';
import { getUserSession } from '~/framework/util/session';

export default {
  startUploadFileAction:
    (file: LocalFile, params: IWorkspaceUploadParams, callbacks?: IUploadCallbaks) =>
    (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
      const session = getUserSession(getState());
      return workspaceService.startUploadFile(session, file, params, callbacks);
    },

  startUploadFilesAction:
    (files: LocalFile[], params: IWorkspaceUploadParams, callbacks?: IUploadCallbaks) =>
    (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
      const session = getUserSession(getState());
      return workspaceService.startUploadFiles(session, files, params, callbacks);
    },

  uploadFileAction:
    (file: LocalFile, params: IWorkspaceUploadParams, callbacks?: IUploadCallbaks) =>
    (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
      const session = getUserSession(getState());
      return workspaceService.uploadFile(session, file, params, callbacks);
    },

  uploadFilesAction:
    (files: LocalFile[], params: IWorkspaceUploadParams, callbacks?: IUploadCallbaks) =>
    (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
      const session = getUserSession(getState());
      return workspaceService.uploadFiles(session, files, params, callbacks);
    },
};
