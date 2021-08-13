
import { ThunkDispatch } from "redux-thunk";
import type { LocalFile } from "../../../util/fileHandler";
import { getUserSession } from "../../../util/session";
import type { IUploadCallbaks } from "../../../util/fileHandler/service";
import workspaceService, { IWorkspaceUploadParams } from "../service";

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
            }


}
