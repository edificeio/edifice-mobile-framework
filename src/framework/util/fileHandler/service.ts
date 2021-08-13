/**
 * API Consumer for Backend Workspace application
 */

/**
 * TODO :
 * - separate fileTransferService and workspaceService
 * - make standard thunks for upload/download + thunk builder
 */

import RNFS, { DownloadBeginCallbackResult, DownloadProgressCallbackResult, UploadBeginCallbackResult, UploadProgressCallbackResult, UploadResult } from "react-native-fs";
import { getAuthHeader } from "../../../infra/oauth";
import { legacyAppConf } from "../appConf";
import { IDistantFile, LocalFile, SyncedFile } from ".";
import { IUserSession } from '../session';

export interface IUploadCommonParams {
    headers?: { [key: string]: string }
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
    /** Upload files to user's workspace. For message a attachments, please use uploadAttachment */
    startUploadFile: (session: IUserSession, file: LocalFile, params: IUploadParams, adapter: (data: any) => IDistantFile , callbacks?: IUploadCallbaks) => {
        const url = legacyAppConf.currentPlatform!.url + params.url;
        console.log("upload to", url);
        const job = RNFS.uploadFiles({
            files: [{ ...file, name: file.filename }], // 'name' field is mandatory but have no utility
            toUrl: url,
            method: 'POST',
            headers: { ...getAuthHeader(), ...params.headers },
            begin: callbacks?.onBegin,
            progress: callbacks?.onProgress,
        });
        console.log("job", job.jobId);

        const newJob = {
            jobId: job.jobId,
            promise: job.promise.then(res => {
                const statusCode = res.statusCode || 0;
                if (statusCode >= 200 && statusCode < 300) {
                    // console.log("body", res.body);
                    const df = adapter(res.body);
                    // console.log(df);
                    return new SyncedFile(file, df);
                }
                else throw new Error('Upload failed: server error ' + JSON.stringify(res));
            }).catch(e => {
                console.warn("Upload error", e);
                throw e;
            })
        }
        return newJob;
    },

    uploadFile: (session: IUserSession, file: LocalFile, params: IUploadParams, adapter: (data: any) => IDistantFile, callbacks?: IUploadCallbaks) => {
        try {
            const job = fileTransferService.startUploadFile(session, file, params, adapter, callbacks);
            return job.promise;
        } catch (e) {
            console.warn("Upload error", e);
            throw e;
        }
    },

    startUploadFiles: (session: IUserSession, files: LocalFile[], params: IUploadParams, adapter: (data: any) => IDistantFile, callbacks?: IUploadCallbaks) => {
        return files.map(f => fileTransferService.startUploadFile(session, f, params, adapter, callbacks));
    },

    uploadFiles: (session: IUserSession, files: LocalFile[], params: IUploadParams, adapter: (data: any) => IDistantFile, callbacks?: IUploadCallbaks) => {
        return Promise.all(fileTransferService.startUploadFiles(session, files, params, adapter, callbacks).map(j => j.promise));
    },

    startDownloadFile: (session: IUserSession, file: IDistantFile, params: IDownloadCallbaks, callbacks?: IDownloadCallbaks) => {
        file.filename = file.filename || file.url.split('/').pop();
        const downloadDest = `${RNFS.DocumentDirectoryPath}/${file.filename}`;
        const downloadUrl = `${legacyAppConf.currentPlatform?.url}${file.url}`;
        const headers = {
            ...getAuthHeader()
        };
        // console.log("from", downloadUrl, "to", downloadDest);
        const job = RNFS.downloadFile({
            fromUrl: downloadUrl,
            toFile: downloadDest,
            headers,
            begin: res => {
                if (res.contentLength) file.filesize = res.contentLength;
                callbacks?.onBegin?.(res);
            },
            progress: callbacks?.onProgress
        });
        // console.log("job", job.jobId);
        const newJob = {
            jobId: job.jobId,
            promise: job.promise.then(res => {
                if (res.statusCode !== 200) throw new Error("Download failed: server error " + JSON.stringify(res));
                const lc = new LocalFile({
                    filename: file.filename!,
                    filepath: 'file://' + downloadDest,
                    filetype: file.filetype || 'application/octet-stream'
                }, {
                    _needIOSReleaseSecureAccess: false
                });
                return new SyncedFile(lc, file);
            }).catch(e => {
                console.warn("Download error", e);
                throw e;
            })
        }
        return newJob;
    },

    downloadFile: async (session: IUserSession, file: IDistantFile, params: IDownloadCallbaks, callbacks?: IDownloadCallbaks) => {
        try {
            const job = fileTransferService.startDownloadFile(session, file, params, callbacks);
            return await job.promise;
        } catch (e) {
            console.warn("Download error", e);
            throw e;
        }
    },

    startDownloadFiles: (session: IUserSession, files: IDistantFile[], params: IDownloadCallbaks, callbacks?: IDownloadCallbaks) => {
        return files.map(f => fileTransferService.startDownloadFile(session, f, params, callbacks));
    },

    downloadFiles: (session: IUserSession, files: IDistantFile[], params: IDownloadCallbaks, callbacks?: IDownloadCallbaks) => {
        return Promise.all(fileTransferService.startDownloadFiles(session, files, params, callbacks).map(j => j.promise));
    },
}

export default fileTransferService;
