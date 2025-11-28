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

const isCustomItem = (file: any): file is LocalFileNS.CustomUploadFileItem =>
  typeof file?.filepath === 'string' && typeof file?.filename === 'string';

const isDocPicker = (file: any): file is DocumentPickerResponse => typeof file?.uri === 'string' && typeof file?.name === 'string';

const isAsset = (file: any): file is Asset => typeof file?.uri === 'string' && typeof file?.fileName === 'string';

export class LocalFile implements LocalFileNS.CustomUploadFileItem {
  filename: string;
  filepath: string;
  _filepathNative: string;
  filesize?: number;
  filetype: string;
  nativeInfo: DocumentPickerResponse | Asset | LocalFileNS.CustomUploadFileItem;
  _needIOSReleaseSecureAccess?: boolean;

  constructor(
    file: DocumentPickerResponse | Asset | LocalFileNS.CustomUploadFileItem,
    opts: { _needIOSReleaseSecureAccess: boolean },
  ) {
    this._needIOSReleaseSecureAccess = opts._needIOSReleaseSecureAccess;

    if (isCustomItem(file)) {
      this.filename = file.filename;
      this._filepathNative = file.filepath;
      this.filetype = file.filetype;
      this.filesize = undefined; // upload item has NO file size
      this.nativeInfo = file;
    } else if (isDocPicker(file)) {
      this.filename = file.name!;
      this._filepathNative = file.uri!;
      this.filetype = file.type ?? 'application/octet-stream';
      this.filesize = file.size ?? undefined;
      this.nativeInfo = file;
    } else if (isAsset(file)) {
      if (!file.uri) throw new Error('Invalid Asset: missing uri');
      if (!file.fileName) throw new Error('Invalid Asset: missing fileName');

      this.filename = file.fileName;
      this._filepathNative = file.uri;
      this.filetype = file.type ?? 'application/octet-stream';
      this.filesize = file.fileSize ?? undefined;
      this.nativeInfo = file;
    } else {
      throw new Error('LocalFile: Invalid file input');
    }

    this.filepath = LocalFile.formatUrlForUpload(this._filepathNative);
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
    if (this._needIOSReleaseSecureAccess) {
      DocumentPicker.releaseSecureAccess([this._filepathNative]);
      this._needIOSReleaseSecureAccess = false;
    }
  };

  static releaseLocalFiles(files: LocalFile[]) {
    files.forEach(f => f.releaseIfNeeded());
  }

  static removeProtocol(url: string): string {
    return url.replace(/^\w*?:\/\/(.+)/, '$1');
  }

  static formatUrlForUpload(url: string): string {
    const cleaned = Platform.select({
      default: decodeURI(LocalFile.removeProtocol(getPath(url))),
      ios: decodeURI(LocalFile.removeProtocol(url)),
    });

    return cleaned || url;
  }

  async open() {
    if (!this.filepath.includes('://')) {
      this.filepath = `file://${this.filepath}`;
      this._filepathNative = `file://${this._filepathNative}`;
    }
    await openDocument(this as any);
  }

  async moveToDownloadFolder() {
    await assertPermissions('documents.write');
    const destFolder = DownloadDirectoryPath;
    const split = this.filename.split('.');
    const ext = split.pop();
    const destPath = `${destFolder}/${split.join('.')}-${moment().format('YYYYMMDD-HHmmss')}.${ext}`;

    await moveFile(this.filepath, destPath);
    this.setPath(destPath);

    if (Platform.OS === 'android') await scanFile(destPath);
  }
}

export namespace LocalFile {
  export type IPickOptionsType = LocalFileNS.IPickOptionsType;
  export type CustomUploadFileItem = LocalFileNS.CustomUploadFileItem;
}
