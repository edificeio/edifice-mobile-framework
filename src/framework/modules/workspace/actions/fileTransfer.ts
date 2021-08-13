
import { ThunkDispatch } from "redux-thunk";
import type { LocalFile } from "../../../util/fileHandler";
import { getUserSession } from "../../../util/session";
import type { IUploadCallbaks, IUploadParams } from "../../../util/fileHandler/service";
import workspaceService from "../service";

export const startUploadFileAction =
    (file: LocalFile, params: IUploadParams, callbacks?: IUploadCallbaks) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return workspaceService.startUploadFile(session, file, params, callbacks);
        }

export const startUploadFilesAction =
    (files: LocalFile[], params: IUploadParams, callbacks?: IUploadCallbaks) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return workspaceService.startUploadFiles(session, files, params, callbacks);
        }

export const uploadFileAction =
    (file: LocalFile, params: IUploadParams, callbacks?: IUploadCallbaks) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return workspaceService.uploadFile(session, file, params, callbacks);
        }

export const uploadFilesAction =
    (files: LocalFile[], params: IUploadParams, callbacks?: IUploadCallbaks) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return workspaceService.uploadFiles(session, files, params, callbacks);
        }
