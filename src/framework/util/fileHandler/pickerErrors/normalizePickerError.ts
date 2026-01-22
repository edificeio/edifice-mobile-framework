import {
  FileManagerError,
  FileManagerErrorCode,
  getFileManagerErrorMessageKey,
  makeError,
} from '~/framework/util/fileHandler/pickerErrors/fileManagerErrorMessages';
import { FileSource } from '~/framework/util/fileHandler/types';

export function isFileManagerError(err: any): err is FileManagerError {
  return (
    err &&
    typeof err === 'object' &&
    typeof err.code === 'string' &&
    err.code !== 'OPERATION_CANCELED' &&
    typeof err.message === 'string'
  );
}

export function normalizePickerError(err: any, source: FileSource): FileManagerError {
  if (isFileManagerError(err)) {
    return {
      ...err,
      source: err.source ?? source,
    };
  }

  if (!err) {
    return {
      code: FileManagerErrorCode.UNKNOWN_ERROR,
      message: getFileManagerErrorMessageKey(FileManagerErrorCode.UNKNOWN_ERROR),
      raw: err,
      source,
    };
  }

  // react-native-image-picker
  if (err.errorCode) {
    if (err.errorCode === 'camera_unavailable') {
      return makeError(FileManagerErrorCode.CAMERA_UNAVAILABLE, source, err);
    }
    return makeError(FileManagerErrorCode.IMAGE_PICKER_ERROR, source, err);
  }

  // DocumentPicker
  if (err.code) {
    if (err.code === 'OPERATION_CANCELED') {
      return makeError(FileManagerErrorCode.PICKER_CANCELLED, source, err);
    }

    return makeError(FileManagerErrorCode.DOC_PICKER_ERROR, source, err);
  }

  if (Object.values(FileManagerErrorCode).includes(err.code as FileManagerErrorCode)) {
    return makeError(err.code as FileManagerErrorCode, source, err.raw ?? err);
  }

  return makeError(FileManagerErrorCode.UNKNOWN_ERROR, source, err);
}
