import { Platform } from 'react-native';

import getPath from '@flyerhq/react-native-android-uri-path';
import DocumentPicker, { DocumentPickerResponse } from '@react-native-documents/picker';
import moment from 'moment';
import { DownloadDirectoryPath, moveFile, scanFile, UploadFileItem } from 'react-native-fs';

import { openDocument } from '../actions';

import { Asset } from '~/framework/util/fileHandler/types';
import { assertPermissions } from '~/framework/util/permissions';

namespace LocalFileNS {
  export type IPickOptionsType = 'image' | 'audio' | 'video';
  export type CustomUploadFileItem = Omit<UploadFileItem, 'name'>;
}

export class LocalFile implements LocalFileNS.CustomUploadFileItem {
  filename: string;
  filepath: string;
  _filepathNative: string;
  filesize?: number;
  filetype: string;
  nativeInfo: DocumentPickerResponse | Asset;
  _needIOSReleaseSecureAccess?: boolean;

  constructor(
    file: DocumentPickerResponse | Asset | LocalFileNS.CustomUploadFileItem,
    opts: { _needIOSReleaseSecureAccess: boolean },
  ) {
    this._needIOSReleaseSecureAccess = opts._needIOSReleaseSecureAccess;

    this.filename =
      (file as LocalFileNS.CustomUploadFileItem).filename || (file as DocumentPickerResponse).name || (file as Asset).fileName!;

    this._filepathNative = (file as LocalFileNS.CustomUploadFileItem).filepath || (file as DocumentPickerResponse | Asset).uri!;

    this.filepath = LocalFile.formatUrlForUpload(this._filepathNative);
    this.filetype = (file as LocalFileNS.CustomUploadFileItem).filetype || (file as DocumentPickerResponse | Asset).type!;

    this.filesize = (file as any).fileSize || (file as any).size || undefined;

    this.nativeInfo = file as DocumentPickerResponse | Asset;
  }

  setExtension(ext: string) {
    this.filename += `.${ext}`;
    this.setPath(`${this.filepath}.${ext}`);
  }

  setPath(path: string) {
    this.filename = path.split('/').pop()!;
    this.filepath = path;
    this._filepathNative = path;
  }

  releaseIfNeeded = () => {
    this._needIOSReleaseSecureAccess && DocumentPicker.releaseSecureAccess([this._filepathNative]);
    this._needIOSReleaseSecureAccess = false;
  };

  static releaseLocalFiles(files: LocalFile[]) {
    files.forEach(f => f.releaseIfNeeded());
  }

  static removeProtocol = (url: string) => url.replace(/^\w*?:\/\/(.+)/, '$1');

  static formatUrlForUpload = (url: string) =>
    Platform.select({
      default: decodeURI(LocalFile.removeProtocol(getPath(url))),
      ios: decodeURI(LocalFile.removeProtocol(url)),
    }) || url;

  async open() {
    if (!this.filepath.includes('://')) {
      this.filepath = 'file://' + this.filepath;
      this._filepathNative = 'file://' + this._filepathNative;
    }
    await openDocument(this as any);
  }

  async moveToDownloadFolder() {
    await assertPermissions('documents.write');
    const destFolder = DownloadDirectoryPath;

    const splitFilename = this.filename.split('.');
    const ext = splitFilename.pop();
    const destPath = `${destFolder}/` + `${splitFilename.join('.')}-${moment().format('YYYYMMDD-HHmmss')}.${ext}`;

    await moveFile(this.filepath, destPath);
    this.setPath(destPath);

    if (Platform.OS === 'android') await scanFile(destPath);
  }
}

export namespace LocalFile {
  export type IPickOptionsType = LocalFileNS.IPickOptionsType;
  export type CustomUploadFileItem = LocalFileNS.CustomUploadFileItem;
}
