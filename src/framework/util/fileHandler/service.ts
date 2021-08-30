/**
 * API Consumer for Backend Workspace application
 */

/**
 * TODO :
 * - separate fileTransferService and workspaceService
 * - make standard thunks for upload/download + thunk builder
 */

import RNFS, {
  DownloadBeginCallbackResult,
  DownloadProgressCallbackResult,
  UploadBeginCallbackResult,
  UploadProgressCallbackResult,
} from 'react-native-fs';

import { IDistantFile, LocalFile, SyncedFile } from '.';
import { getAuthHeader } from '../../../infra/oauth';
import { legacyAppConf } from '../appConf';
import { assertPermissions } from '../permissions';
import { IUserSession } from '../session';

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
  startUploadFile: (
    session: IUserSession,
    file: LocalFile,
    params: IUploadParams,
    adapter: (data: any) => IDistantFile,
    callbacks?: IUploadCallbaks,
  ) => {
    const url = legacyAppConf.currentPlatform!.url + params.url;
    const job = RNFS.uploadFiles({
      files: [{ ...file, name: 'file' }],
      toUrl: url,
      method: 'POST',
      fields: { ...params.fields },
      headers: { ...getAuthHeader(), ...params.headers },
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
            return new SyncedFile(file, df);
          } else throw new Error('Upload failed: server error ' + JSON.stringify(res));
        })
        .catch(e => {
          console.warn('Upload error', e);
          throw e;
        }),
    };
    return newJob;
  },

  /** Upload a file to the given url. */
  uploadFile: (
    session: IUserSession,
    file: LocalFile,
    params: IUploadParams,
    adapter: (data: any) => IDistantFile,
    callbacks?: IUploadCallbaks,
  ) => {
    try {
      const job = fileTransferService.startUploadFile(session, file, params, adapter, callbacks);
      return job.promise;
    } catch (e) {
      console.warn('Upload error', e);
      throw e;
    }
  },

  startUploadFiles: (
    session: IUserSession,
    files: LocalFile[],
    params: IUploadParams,
    adapter: (data: any) => IDistantFile,
    callbacks?: IUploadCallbaks,
  ) => {
    return files.map(f => fileTransferService.startUploadFile(session, f, params, adapter, callbacks));
  },

  uploadFiles: (
    session: IUserSession,
    files: LocalFile[],
    params: IUploadParams,
    adapter: (data: any) => IDistantFile,
    callbacks?: IUploadCallbaks,
  ) => {
    return Promise.all(fileTransferService.startUploadFiles(session, files, params, adapter, callbacks).map(j => j.promise));
  },

  /** Download a file that exists in the server. This function returns more information than `downloadFile` to better handle file suring download. */
  startDownloadFile: async (session: IUserSession, file: IDistantFile, params: IDownloadParams, callbacks?: IDownloadCallbaks) => {
    file.filename = file.filename || file.url.split('/').pop();
    const folderDest = `${RNFS.DocumentDirectoryPath}${file.url}`;
    const downloadDest = `${folderDest}/${file.filename}`;
    const downloadUrl = `${legacyAppConf.currentPlatform?.url}${file.url}`;
    const headers = { ...getAuthHeader() };
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
      const files = await RNFS.readDir(folderDest);
      if (files.length !== 1) throw new Error('Malformed documents folder ');
      localFile.setPath(files[0].path);
      return new Promise<{
        jobId: number;
        promise: Promise<SyncedFile>;
      }>(resolve =>
        resolve({
          jobId: 0,
          promise: new Promise(resolve => resolve(new SyncedFile(localFile, file))),
        }),
      );
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
        if (!file.filetype && type?.length) localFile.filetype = type;
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
          if (localFile.filename.indexOf('.') === -1 && localFile.filetype.indexOf('/') !== -1) {
            const ext = localFile.filetype.split('/').pop()!;
            const toMove = localFile.filepath;
            localFile.setExtension(ext);
            RNFS.moveFile(toMove, localFile.filepath);
          }
          // return
          return new SyncedFile(localFile, file);
        })
        .catch(e => {
          console.warn('Download error', e);
          throw e;
        }),
    };
    return newJob;
  },

  /** Download a file that exists in the server. */
  downloadFile: async (session: IUserSession, file: IDistantFile, params: IDownloadParams, callbacks?: IDownloadCallbaks) => {
    try {
      const job = await fileTransferService.startDownloadFile(session, file, params, callbacks);
      return job.promise;
    } catch (e) {
      console.warn('Download error', e);
      throw e;
    }
  },

  startDownloadFiles: (session: IUserSession, files: IDistantFile[], params: IDownloadParams, callbacks?: IDownloadCallbaks) => {
    return files.map(f => fileTransferService.startDownloadFile(session, f, params, callbacks));
  },

  downloadFiles: (session: IUserSession, files: IDistantFile[], params: IDownloadParams, callbacks?: IDownloadCallbaks) => {
    return Promise.all(fileTransferService.startDownloadFiles(session, files, params, callbacks).map(async j => (await j).promise));
  },
};

export default fileTransferService;
