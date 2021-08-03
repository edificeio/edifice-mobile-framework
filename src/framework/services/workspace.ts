/**
 * API Consumer for Backend Workspace application
 */

import queryString from "query-string";
import RNFS, { DownloadBeginCallbackResult, DownloadProgressCallbackResult, UploadBeginCallbackResult, UploadProgressCallbackResult, UploadResult } from "react-native-fs";
import { getAuthHeader } from "../../infra/oauth";
import { legacyAppConf } from "../util/appConf";
import { IDistantFile, LocalFile, SyncedFile } from "../util/file";
import { IUserSession } from '../util/session';

export interface IUploadParams {
    parent?: 'owner' | 'shared' | 'protected' | 'root' | 'trash';
}

export interface IUploadCallbaks {
    onBegin?: (response: UploadBeginCallbackResult) => void;
    onProgress?: (Response: UploadProgressCallbackResult) => void;
}


export interface IDownloadParams {
    useDownloadManagerAndroid?: boolean;
}

export interface IDownloadCallbaks {
    onBegin?: (response: DownloadBeginCallbackResult) => void;
    onProgress?: (Response: DownloadProgressCallbackResult) => void;
}

const getImplicitUploadParams = (params: IUploadParams) => {
    return params.parent === 'protected' ? { protected: 'true', application: 'media-library' } : {};
};

const getThumbnailUploadParams = () => {
    return {
        quality: '1',
        // thumbnail: '120x120',
        thumbnail: ['100x100', '120x120', '290x290', '381x381', '1600x0'],
    };
};

const workspaceService = {
    /** Upload files to user's workspace. For message a attachments, please use uploadAttachment */
    startUploadFile: (session: IUserSession, file: LocalFile, params: IUploadParams, callbacks?: IUploadCallbaks) => {
        const api = legacyAppConf.currentPlatform!.url + '/workspace/document';
        const url = queryString.stringifyUrl({
            url: api,
            query: { ...params, ...getImplicitUploadParams(params), ...getThumbnailUploadParams() },
        });
        const job = RNFS.uploadFiles({
            files: [file],
            toUrl: url,
            method: 'POST',
            headers: { ...getAuthHeader() },
            begin: callbacks?.onBegin,
            progress: callbacks?.onProgress,
        });
        // console.log("job", job.jobId);

        const newJob = {
            jobId: job.jobId,
            promise: job.promise.then(res => {
                const statusCode = res.statusCode || 0;
                if (statusCode >= 200 && statusCode < 300) {
                    const resfile = JSON.parse(res.body);
                    const df: IDistantFile = {
                        ...file,
                        url: `/workspace/document/${resfile['_id']}`,
                        filesize: resfile['metadata']?.['size'],
                        filename: resfile['name'] || file.filename
                    };
                    console.log(df);
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

    uploadFile: (session: IUserSession, file: LocalFile, params: IUploadParams, callbacks?: IUploadCallbaks) => {
        try {
            const job = workspaceService.startUploadFile(session, file, params, callbacks);
            return job.promise;
        } catch (e) {
            console.warn("Upload error", e);
            throw e;
        }
    },

    startUploadFiles: (session: IUserSession, files: LocalFile[], params: IUploadParams, callbacks?: IUploadCallbaks) => {
        return files.map(f => workspaceService.startUploadFile(session, f, params, callbacks));
    },

    uploadFiles: (session: IUserSession, files: LocalFile[], params: IUploadParams, callbacks?: IUploadCallbaks) => {
        return Promise.all(workspaceService.startUploadFiles(session, files, params, callbacks).map(j => j.promise));
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
                    name: file.filename!,
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
            const job = workspaceService.startDownloadFile(session, file, params, callbacks);
            return await job.promise;
        } catch (e) {
            console.warn("Download error", e);
            throw e;
        }
    },

    startDownloadFiles: (session: IUserSession, files: IDistantFile[], params: IDownloadCallbaks, callbacks?: IDownloadCallbaks) => {
        return files.map(f => workspaceService.startDownloadFile(session, f, params, callbacks));
    },

    downloadFiles: (session: IUserSession, files: IDistantFile[], params: IDownloadCallbaks, callbacks?: IDownloadCallbaks) => {
        return Promise.all(workspaceService.startDownloadFiles(session, files, params, callbacks).map(j => j.promise));
    },
}

export default workspaceService;
