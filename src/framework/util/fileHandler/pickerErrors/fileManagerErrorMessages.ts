import { FileSource } from '~/framework/util/fileHandler/types';

export enum FileManagerErrorCode {
  PICKER_CANCELLED = 'PICKER_CANCELLED',
  CAMERA_UNAVAILABLE = 'CAMERA_UNAVAILABLE',
  IMAGE_PICKER_ERROR = 'IMAGE_PICKER_ERROR',
  DOC_PICKER_ERROR = 'DOC_PICKER_ERROR',
  FILE_COPY_FAILED = 'FILE_COPY_FAILED',
  IMAGE_PROCESSING_FAILED = 'IMAGE_PROCESSING_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export enum FileManagerErrorMessageKey {
  CAMERA_UNAVAILABLE = 'error-filemanager-camera-unavailable',
  DOC_PICKER_ERROR = 'error-filemanager-doc-picker-error',
  FILE_COPY_FAILED = 'error-filemanager-file-copy-failed',
  IMAGE_PICKER_ERROR = 'error-filemanager-image-picker-error',
  IMAGE_PROCESSING_FAILED = 'error-filemanager-image-processing-failed',
  PICKER_CANCELLED = 'error-filemanager-picker-cancelled',
  UNKNOWN_ERROR = 'error-filemanager-unknown',
}

export const fileManagerErrorMessages: Record<FileManagerErrorCode, FileManagerErrorMessageKey> = {
  [FileManagerErrorCode.CAMERA_UNAVAILABLE]: FileManagerErrorMessageKey.CAMERA_UNAVAILABLE,
  [FileManagerErrorCode.DOC_PICKER_ERROR]: FileManagerErrorMessageKey.DOC_PICKER_ERROR,
  [FileManagerErrorCode.FILE_COPY_FAILED]: FileManagerErrorMessageKey.FILE_COPY_FAILED,
  [FileManagerErrorCode.IMAGE_PICKER_ERROR]: FileManagerErrorMessageKey.IMAGE_PICKER_ERROR,
  [FileManagerErrorCode.IMAGE_PROCESSING_FAILED]: FileManagerErrorMessageKey.IMAGE_PROCESSING_FAILED,
  [FileManagerErrorCode.PICKER_CANCELLED]: FileManagerErrorMessageKey.PICKER_CANCELLED,
  [FileManagerErrorCode.UNKNOWN_ERROR]: FileManagerErrorMessageKey.UNKNOWN_ERROR,
};

export function getFileManagerErrorMessageKey(code: FileManagerErrorCode): FileManagerErrorMessageKey {
  return fileManagerErrorMessages[code] ?? FileManagerErrorMessageKey.UNKNOWN_ERROR;
}

export interface FileManagerError {
  code: FileManagerErrorCode;
  message: FileManagerErrorMessageKey;
  raw?: any;
  source?: FileSource;
}

export function makeError(code: FileManagerErrorCode, source: FileSource, raw?: any): FileManagerError {
  return {
    code,
    message: getFileManagerErrorMessageKey(code),
    raw,
    source,
  };
}
