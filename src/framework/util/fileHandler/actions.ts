/**
 * Actions for file handler
 */
import FileViewer from 'react-native-file-viewer';
import { NavigationInjectedProps } from 'react-navigation';
import { ThunkDispatch } from 'redux-thunk';

import { openCarousel } from '~/framework/components/carousel';
import { MediaType, openMediaPlayer } from '~/framework/components/media/player';
import { getUserSession } from '~/framework/util/session';
import { urlSigner } from '~/infra/oauth';

import { IAnyDistantFile, IDistantFile, LocalFile, SyncedFile } from '.';
import { IMedia } from '../media';
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
    const session = getUserSession();
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
    const session = getUserSession();
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
    const session = getUserSession();
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
    const session = getUserSession();
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
    const session = getUserSession();
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
    const session = getUserSession();
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
    const session = getUserSession();
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
    const session = getUserSession();
    return fileTransferService.downloadFiles(session, files, params, callbacks, syncedFileClass);
  };

const isDocumentDistantFile = (document: IDistantFile | LocalFile | IMedia): document is IDistantFile =>
  !!(document as IDistantFile).url;

const getMediaTypeFromMime = (mime: string | null | undefined): IMedia['type'] | undefined => {
  if (!mime) return undefined;
  if (mime.startsWith('image')) {
    return 'image';
  } else if (mime.startsWith('audio')) {
    return 'audio';
  } else if (mime.startsWith('video')) {
    return 'video';
  }
};

export const openDocument = async (
  document: IDistantFile | LocalFile | IMedia,
  navigation: NavigationInjectedProps['navigation'], // ToDo: Remove this proptery when RN6
) => {
  let mediaType: IMedia['type'] | undefined;
  let syncedFile: SyncedFile | undefined;
  let localFile: LocalFile | undefined;
  let onlineMedia: IMedia | undefined;

  if (isDocumentDistantFile(document)) {
    mediaType = getMediaTypeFromMime(document.filetype);
    if (!mediaType) {
      const session = getUserSession();
      syncedFile = await fileTransferService.downloadFile(session, document, {});
      localFile = syncedFile.lf;
    } else {
      onlineMedia = {
        type: mediaType,
        src: document.url,
      };
    }
  } else if (document instanceof LocalFile) {
    localFile = document;
    mediaType = getMediaTypeFromMime(localFile.filetype);
  } /* IMedia */ else {
    onlineMedia = document as IMedia;
    mediaType = (document as IMedia).type;
  }

  switch (mediaType) {
    case 'image':
      openCarousel(
        {
          data: [
            onlineMedia ?? {
              type: 'image',
              src: localFile?.filepath!,
            },
          ],
        },
        navigation,
      );
      break;
    case 'audio':
      openMediaPlayer(
        { type: MediaType.AUDIO, source: urlSigner.signURISource(onlineMedia?.src ?? localFile?.filepath) },
        navigation,
      );
      break;
    case 'video':
      openMediaPlayer(
        { type: MediaType.VIDEO, source: urlSigner.signURISource(onlineMedia?.src ?? localFile?.filepath) },
        navigation,
      );
      break;
    default:
      if (localFile) {
        await FileViewer.open(localFile.filepath, {
          showOpenWithDialog: true,
          showAppsSuggestions: true,
        });
      }
  }

  if (syncedFile) return syncedFile;
  if (localFile) return localFile;
  return onlineMedia;
};
