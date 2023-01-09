/**
 * API Consumer for Backend Workspace application
 */

/**
 * TODO :
 * - separate fileTransferService and workspaceService
 * - make standard thunks for upload/download + thunk builder
 */
import mime from 'mime';
import RNFS, {
  DownloadBeginCallbackResult,
  DownloadProgressCallbackResult,
  UploadBeginCallbackResult,
  UploadProgressCallbackResult,
} from 'react-native-fs';

import { ISession } from '~/framework/modules/auth/model';
import { assertSession } from '~/framework/modules/auth/reducer';
import { assertPermissions } from '~/framework/util/permissions';
import { urlSigner } from '~/infra/oauth';

import { IAnyDistantFile, IDistantFile, LocalFile, SyncedFile } from '.';

export interface IUploadCommonParams {
  fields?: { [key: string]: string };
  headers?: { [key: string]: string };
  binaryStreamOnly?: boolean;
}
export interface IUploadParams extends IUploadCommonParams {
  url: string;
}

export interface IUploadCallbaks {
  onBegin?: (response: UploadBeginCallbackResult) => void;
  onProgress?: (Response: UploadProgressCallbackResult) => void;
}

export interface IDownloadParams {
  useDownloadManagerAndroid?: boolean; // ToDo: implement this
}

export interface IDownloadCallbaks {
  onBegin?: (response: DownloadBeginCallbackResult) => void;
  onProgress?: (Response: DownloadProgressCallbackResult) => void;
}

const fileTransferService = {
  /** Upload a file to the given url. This function returns more information than `uploadFile` to better handle file suring upload. */
  startUploadFile: <SyncedFileType extends SyncedFile<IAnyDistantFile> = SyncedFile<IAnyDistantFile>>(
    session: ISession,
    file: LocalFile,
    params: IUploadParams,
    adapter: (data: any) => SyncedFileType['df'],
    callbacks?: IUploadCallbaks,
    syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType,
  ) => {
    const url = session.platform.url + params.url;
    const job = RNFS.uploadFiles({
      files: [{ ...file, name: 'file' }],
      toUrl: url,
      method: 'POST',
      fields: { ...params.fields },
      headers: { ...urlSigner.getAuthHeader(), ...params.headers },
      binaryStreamOnly: params.binaryStreamOnly,
      begin: callbacks?.onBegin,
      progress: callbacks?.onProgress,
    });
    const newJob = {
      jobId: job.jobId,
      promise: job.promise
        .then(res => {
          const statusCode = res.statusCode || 0;
          if (statusCode >= 200 && statusCode < 300) {
            const df = adapter(res.body);
            const sfclass = (syncedFileClass ?? SyncedFile) as new (
              ...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]
            ) => SyncedFileType;
            return new sfclass(file, df) as SyncedFileType;
          } else {
            const err = new Error('Upload failed: server error ' + JSON.stringify(res));
            err.response = res;
            throw err;
          }
        })
        .catch(e => {
          throw e;
        }),
    };
    return newJob;
  },

  /** Upload a file to the given url. */
  uploadFile: <SyncedFileType extends SyncedFile<IAnyDistantFile> = SyncedFile<IAnyDistantFile>>(
    session: ISession,
    file: LocalFile,
    params: IUploadParams,
    adapter: (data: any) => SyncedFileType['df'],
    callbacks?: IUploadCallbaks,
    syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType,
  ) => {
    try {
      const job = fileTransferService.startUploadFile(session, file, params, adapter, callbacks, syncedFileClass);
      return job.promise;
    } catch (e) {
      throw e;
    }
  },

  startUploadFiles: <SyncedFileType extends SyncedFile<IAnyDistantFile> = SyncedFile<IAnyDistantFile>>(
    session: ISession,
    files: LocalFile[],
    params: IUploadParams,
    adapter: (data: any) => SyncedFileType['df'],
    callbacks?: IUploadCallbaks,
    syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType,
  ) => {
    return files.map(f => fileTransferService.startUploadFile(session, f, params, adapter, callbacks, syncedFileClass));
  },

  uploadFiles: <SyncedFileType extends SyncedFile<IAnyDistantFile> = SyncedFile<IAnyDistantFile>>(
    session: ISession,
    files: LocalFile[],
    params: IUploadParams,
    adapter: (data: any) => SyncedFileType['df'],
    callbacks?: IUploadCallbaks,
    syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType,
  ) => {
    return Promise.all(
      fileTransferService.startUploadFiles(session, files, params, adapter, callbacks, syncedFileClass).map(j => j.promise),
    );
  },

  /** Download a file that exists in the server. This function returns more information than `downloadFile` to better handle file suring download. */
  startDownloadFile: async <SyncedFileType extends SyncedFile<IAnyDistantFile> = SyncedFile<IAnyDistantFile>>(
    session: ISession,
    file: IDistantFile,
    params: IDownloadParams,
    callbacks?: IDownloadCallbaks,
    syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType,
  ) => {
    const sfclass = (syncedFileClass ?? SyncedFile) as new (
      ...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]
    ) => SyncedFileType;
    file.filename = file.filename || file.url.split('/').pop();
    const folderDest = `${RNFS.DocumentDirectoryPath}${file.url}`;
    const downloadDest = `${folderDest}/${file.filename}`;
    const downloadUrl = `${session.platform.url}${file.url}`;
    const headers = { ...urlSigner.getAuthHeader() };
    const localFile = new LocalFile(
      {
        filename: file.filename!,
        filepath: 'file://' + downloadDest,
        filetype: file.filetype || 'application/octet-stream',
      },
      {
        _needIOSReleaseSecureAccess: false,
      },
    );
    // If destination folder exists, return first (and only!) file
    const exists = await RNFS.exists(folderDest);
    if (exists) {
      try {
        const files = await RNFS.readDir(folderDest);
        if (files.length >= 1) {
          const foundFile = files.find(f => f.name === file.filename);
          if (foundFile) {
            localFile.setPath(foundFile.path);
            return await new Promise<{
              jobId: number;
              promise: Promise<SyncedFileType>;
            }>(resolve =>
              resolve({
                jobId: 0,
                promise: new Promise(resolve => resolve(new sfclass(localFile, file))),
              }),
            );
          }
        }
      } catch (e) {
        // empty
      }
    }
    // Assert Permission
    await assertPermissions('documents.write');
    // Create destination folder if needed
    // RNFS Automatically creates parents and does not throw if already exists (works like Linux mkdir -p)
    RNFS.mkdir(folderDest, { NSURLIsExcludedFromBackupKey: true });
    // Download file now!
    const job = RNFS.downloadFile({
      fromUrl: downloadUrl,
      toFile: downloadDest,
      headers,
      begin: res => {
        const type = res?.headers['Content-Type'];
        if (res.contentLength) file.filesize = res.contentLength;
        if (!file.filetype && type?.length) localFile.filetype = type === 'image/jpg' ? 'image/jpeg' : type;
        callbacks?.onBegin?.(res);
      },
      progress: callbacks?.onProgress,
    });
    const newJob = {
      jobId: job.jobId,
      promise: job.promise
        .then(res => {
          if (res.statusCode < 200 || res.statusCode > 299) throw new Error('Download failed: server error ' + JSON.stringify(res));
          // rename local file if file name has no extension and file type is known
          if (localFile.filename.indexOf('.') === -1) {
            // const ext = localFile.filetype.split('/').pop()!;
            const ext = mime.getExtension(localFile.filetype);
            const toMove = localFile.filepath;
            if (ext) {
              localFile.setExtension(ext);
              RNFS.moveFile(toMove, localFile.filepath);
            }
          }
          // return
          return new sfclass(localFile, file);
        })
        .catch(e => {
          throw e;
        }),
    };
    return newJob;
  },

  /** Download a file that exists in the server. */
  downloadFile: async <SyncedFileType extends SyncedFile<IAnyDistantFile> = SyncedFile<IAnyDistantFile>>(
    session: ISession,
    file: IDistantFile,
    params: IDownloadParams,
    callbacks?: IDownloadCallbaks,
    syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType,
  ) => {
    try {
      const job = await fileTransferService.startDownloadFile(session, file, params, callbacks, syncedFileClass);
      return job.promise;
    } catch (e) {
      throw e;
    }
  },

  startDownloadFiles: <SyncedFileType extends SyncedFile<IAnyDistantFile> = SyncedFile<IAnyDistantFile>>(
    session: ISession,
    files: IDistantFile[],
    params: IDownloadParams,
    callbacks?: IDownloadCallbaks,
    syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType,
  ) => {
    return files.map(f => fileTransferService.startDownloadFile(session, f, params, callbacks, syncedFileClass));
  },

  downloadFiles: <SyncedFileType extends SyncedFile<IAnyDistantFile> = SyncedFile<IAnyDistantFile>>(
    session: ISession,
    files: IDistantFile[],
    params: IDownloadParams,
    callbacks?: IDownloadCallbaks,
    syncedFileClass?: new (...arguments_: [SyncedFileType['lf'], SyncedFileType['df']]) => SyncedFileType,
  ) => {
    return Promise.all(
      fileTransferService.startDownloadFiles(session, files, params, callbacks, syncedFileClass).map(async j => (await j).promise),
    );
  },
};

export default fileTransferService;
