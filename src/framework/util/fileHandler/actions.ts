/**
 * Actions for file handler
 */

import { ThunkDispatch } from "redux-thunk";
import type { IDistantFile, LocalFile } from ".";
import { getUserSession } from "../session";
import fileTransferService, { IDownloadCallbaks, IUploadCallbaks, IUploadParams } from "./service";

export const startUploadFileAction =
    (file: LocalFile, params: IUploadParams, adapter: (data: any) => IDistantFile, callbacks?: IUploadCallbaks) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return fileTransferService.startUploadFile(session, file, params, adapter, callbacks);
        }

export const startUploadFilesAction =
    (files: LocalFile[], params: IUploadParams, adapter: (data: any) => IDistantFile, callbacks?: IUploadCallbaks) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return fileTransferService.startUploadFiles(session, files, params, adapter, callbacks);
        }

export const uploadFileAction =
    (file: LocalFile, params: IUploadParams, adapter: (data: any) => IDistantFile, callbacks?: IUploadCallbaks) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return fileTransferService.uploadFile(session, file, params, adapter, callbacks);
        }

export const uploadFilesAction =
    (files: LocalFile[], params: IUploadParams, adapter: (data: any) => IDistantFile, callbacks?: IUploadCallbaks) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return fileTransferService.uploadFiles(session, files, params, adapter, callbacks);
        }

export const startDownloadFileAction =
    (file: IDistantFile, params: IDownloadCallbaks, callbacks?: IDownloadCallbaks) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return fileTransferService.startDownloadFile(session, file, params, callbacks);
        }

export const startDownloadFilesAction =
    (files: IDistantFile[], params: IDownloadCallbaks, callbacks?: IDownloadCallbaks) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return fileTransferService.startDownloadFiles(session, files, params, callbacks);
        }

export const downloadFileAction =
    (file: IDistantFile, params: IDownloadCallbaks, callbacks?: IDownloadCallbaks) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return fileTransferService.downloadFile(session, file, params, callbacks);
        }

export const downloadFilesAction =
    (files: IDistantFile[], params: IDownloadCallbaks, callbacks?: IDownloadCallbaks) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return fileTransferService.downloadFiles(session, files, params, callbacks);
        }
