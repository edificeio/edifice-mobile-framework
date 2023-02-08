/**
 * Actions for file handler
 */
import { ThunkDispatch } from 'redux-thunk';

import { assertSession } from '~/framework/modules/auth/reducer';

import type { IAnyDistantFile, IDistantFile, LocalFile, SyncedFile } from '.';
import fileTransferService, { IDownloadCallbaks, IDownloadParams, IUploadCallbaks, IUploadParams } from './service';

export const startUploadFileAction =
  <SyncedFileType extends SyncedFile<IAnyDistantFile> = SyncedFile<IAnyDistantFile>>(
    file: LocalFile,
    params: IUploadParams,
    adapter: (data: any) => SyncedFileType['df'],
    callbacks?: IUploadCallbaks,
    syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType,
  ) =>
  (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const session = assertSession();
    return fileTransferService.startUploadFile(session, file, params, adapter, callbacks, syncedFileClass);
  };

export const startUploadFilesAction =
  <SyncedFileType extends SyncedFile<IAnyDistantFile> = SyncedFile<IAnyDistantFile>>(
    files: LocalFile[],
    params: IUploadParams,
    adapter: (data: any) => SyncedFileType['df'],
    callbacks?: IUploadCallbaks,
    syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType,
  ) =>
  (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const session = assertSession();
    return fileTransferService.startUploadFiles(session, files, params, adapter, callbacks, syncedFileClass);
  };

export const uploadFileAction =
  <SyncedFileType extends SyncedFile<IAnyDistantFile> = SyncedFile<IAnyDistantFile>>(
    file: LocalFile,
    params: IUploadParams,
    adapter: (data: any) => SyncedFileType['df'],
    callbacks?: IUploadCallbaks,
    syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType,
  ) =>
  (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const session = assertSession();
    return fileTransferService.uploadFile(session, file, params, adapter, callbacks, syncedFileClass);
  };

export const uploadFilesAction =
  <SyncedFileType extends SyncedFile<IAnyDistantFile> = SyncedFile<IAnyDistantFile>>(
    files: LocalFile[],
    params: IUploadParams,
    adapter: (data: any) => SyncedFileType['df'],
    callbacks?: IUploadCallbaks,
    syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType,
  ) =>
  (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const session = assertSession();
    return fileTransferService.uploadFiles(session, files, params, adapter, callbacks, syncedFileClass);
  };

export const startDownloadFileAction =
  <SyncedFileType extends SyncedFile<IAnyDistantFile> = SyncedFile<IAnyDistantFile>>(
    file: IDistantFile,
    params: IDownloadParams,
    callbacks?: IDownloadCallbaks,
    syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType,
  ) =>
  (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const session = assertSession();
    return fileTransferService.startDownloadFile(session, file, params, callbacks, syncedFileClass);
  };

export const startDownloadFilesAction =
  <SyncedFileType extends SyncedFile<IAnyDistantFile> = SyncedFile<IAnyDistantFile>>(
    files: IDistantFile[],
    params: IDownloadParams,
    callbacks?: IDownloadCallbaks,
    syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType,
  ) =>
  (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const session = assertSession();
    return fileTransferService.startDownloadFiles(session, files, params, callbacks, syncedFileClass);
  };

export const downloadFileAction =
  <SyncedFileType extends SyncedFile<IAnyDistantFile> = SyncedFile<IAnyDistantFile>>(
    file: IDistantFile,
    params: IDownloadParams,
    callbacks?: IDownloadCallbaks,
    syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType,
  ) =>
  (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const session = assertSession();
    return fileTransferService.downloadFile(session, file, params, callbacks, syncedFileClass);
  };

export const downloadFilesAction =
  <SyncedFileType extends SyncedFile<IAnyDistantFile> = SyncedFile<IAnyDistantFile>>(
    files: IDistantFile[],
    params: IDownloadParams,
    callbacks?: IDownloadCallbaks,
    syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType,
  ) =>
  (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const session = assertSession();
    return fileTransferService.downloadFiles(session, files, params, callbacks, syncedFileClass);
  };
