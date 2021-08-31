/**
 * Actions for file handler
 */

import { ThunkDispatch } from "redux-thunk";

import type { IDistantFile, LocalFile, SyncedFile } from ".";
import { getUserSession } from "../session";
import fileTransferService, { IDownloadCallbaks, IDownloadParams, IUploadCallbaks, IUploadParams } from "./service";

export const startUploadFileAction =
    <SyncedFileType extends SyncedFile<any> = SyncedFile<any>>(
        file: LocalFile,
        params: IUploadParams,
        adapter: (data: any) => SyncedFileType['df'],
        callbacks?: IUploadCallbaks,
        syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType
    ) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return fileTransferService.startUploadFile(session, file, params, adapter, callbacks, syncedFileClass);
        }

export const startUploadFilesAction =
    <SyncedFileType extends SyncedFile<any> = SyncedFile<any>>(
        files: LocalFile[],
        params: IUploadParams,
        adapter: (data: any) => SyncedFileType['df'],
        callbacks?: IUploadCallbaks,
        syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType
    ) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return fileTransferService.startUploadFiles(session, files, params, adapter, callbacks, syncedFileClass);
        }

export const uploadFileAction =
    <SyncedFileType extends SyncedFile<any> = SyncedFile<any>>(
        file: LocalFile,
        params: IUploadParams,
        adapter: (data: any) => SyncedFileType['df'],
        callbacks?: IUploadCallbaks,
        syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType
    ) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return fileTransferService.uploadFile(session, file, params, adapter, callbacks, syncedFileClass);
        }

export const uploadFilesAction =
    <SyncedFileType extends SyncedFile<any> = SyncedFile<any>>(
        files: LocalFile[],
        params: IUploadParams,
        adapter: (data: any) => SyncedFileType['df'],
        callbacks?: IUploadCallbaks,
        syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType
    ) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return fileTransferService.uploadFiles(session, files, params, adapter, callbacks, syncedFileClass);
        }

export const startDownloadFileAction =
    <SyncedFileType extends SyncedFile<any> = SyncedFile<any>>(
        file: IDistantFile,
        params: IDownloadParams,
        callbacks?: IDownloadCallbaks,
        syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType
    ) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return fileTransferService.startDownloadFile(session, file, params, callbacks, syncedFileClass);
        }

export const startDownloadFilesAction =
    <SyncedFileType extends SyncedFile<any> = SyncedFile<any>>(
        files: IDistantFile[],
        params: IDownloadParams,
        callbacks?: IDownloadCallbaks,
        syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType
    ) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return fileTransferService.startDownloadFiles(session, files, params, callbacks, syncedFileClass);
        }

export const downloadFileAction =
    <SyncedFileType extends SyncedFile<any> = SyncedFile<any>>(
        file: IDistantFile,
        params: IDownloadParams,
        callbacks?: IDownloadCallbaks,
        syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType
    ) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return fileTransferService.downloadFile(session, file, params, callbacks, syncedFileClass);
        }

export const downloadFilesAction =
    <SyncedFileType extends SyncedFile<any> = SyncedFile<any>>(
        files: IDistantFile[],
        params: IDownloadParams,
        callbacks?: IDownloadCallbaks,
        syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType
    ) =>
        (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
            const session = getUserSession(getState());
            return fileTransferService.downloadFiles(session, files, params, callbacks, syncedFileClass);
        }
