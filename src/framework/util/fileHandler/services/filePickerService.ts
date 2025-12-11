import { Platform } from 'react-native';

import getPath from '@flyerhq/react-native-android-uri-path';
import { pick, types } from '@react-native-documents/picker';
import moment from 'moment';
import RNFS from 'react-native-fs';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { LocalFile } from '~/framework/util/fileHandler/models';
import { FileManagerErrorCode, makeError } from '~/framework/util/fileHandler/pickerErrors/fileManagerErrorMessages';
import { Asset, FileSource } from '~/framework/util/fileHandler/types';
import { fallbackMime, getExtSafe, guessMimeFromExt, processImage, safe, wrapPicker } from '~/framework/util/fileHandler/utils';

/* ---------------------------------------------
 * GALLERY
 * --------------------------------------------- */

export function pickFromGallery(
  options: {
    multiple?: boolean;
    allowedTypes?: Array<'image' | 'video'>;
  } = {},
): Promise<LocalFile[]> {
  const { allowedTypes = ['image'], multiple } = options;

  const hasImage = allowedTypes.includes('image');
  const hasVideo = allowedTypes.includes('video');
  const fileSource: FileSource = 'gallery';

  let mediaType: 'photo' | 'video' | 'mixed';

  if (hasImage && hasVideo) {
    mediaType = 'mixed';
  } else if (hasVideo) {
    mediaType = 'video';
  } else {
    mediaType = 'photo';
  }

  return wrapPicker(async callback => {
    const res = await launchImageLibrary({
      includeExtra: true,
      mediaType,
      selectionLimit: multiple ? 0 : 1,
    });

    if (res.didCancel || !res.assets) {
      throw makeError(FileManagerErrorCode.PICKER_CANCELLED, fileSource, res);
    }

    const processedAssets = await Promise.all(
      res.assets.map(async item => {
        const ext = getExtSafe(item.fileName) ?? 'mp4';

        if (item.type?.startsWith('video/')) {
          if (!item.uri) {
            throw makeError(FileManagerErrorCode.FILE_COPY_FAILED, fileSource, item);
          }

          const filename = `${moment().format('YYYYMMDD-HHmmss')}.${ext}`;
          const dest = `${RNFS.CachesDirectoryPath}/${filename}`;

          try {
            await RNFS.copyFile(item.uri, dest);
          } catch (err) {
            throw makeError(FileManagerErrorCode.FILE_COPY_FAILED, fileSource, err);
          }

          return {
            duration: item.duration,
            fileName: filename,
            fileSize: item.fileSize ?? 0,
            height: item.height ?? 0,
            name: filename,
            originalPath: item.uri,
            type: fallbackMime(item.type, filename),
            uri: 'file://' + dest,
            width: item.width ?? 0,
          } as Asset;
        }

        // IMAGE
        let img: Asset | null;
        try {
          img = await processImage(item);
        } catch (err) {
          throw makeError(FileManagerErrorCode.IMAGE_PROCESSING_FAILED, fileSource, err);
        }

        if (!img) {
          throw makeError(FileManagerErrorCode.IMAGE_PROCESSING_FAILED, fileSource, item);
        }

        return img;
      }),
    );

    callback(processedAssets.map(a => new LocalFile(a, { _needIOSReleaseSecureAccess: false })));
  });
}

/* ---------------------------------------------
 * CAMERA
 * --------------------------------------------- */

export function pickFromCamera(
  options: {
    useFrontCamera?: boolean;
    mode?: 'photo' | 'video';
  } = {},
): Promise<LocalFile[]> {
  const { mode = 'photo', useFrontCamera = false } = options;
  const fileSource: FileSource = 'camera';

  return wrapPicker(async callback => {
    const res = await launchCamera({
      cameraType: useFrontCamera ? 'front' : 'back',
      includeExtra: true,
      mediaType: mode === 'video' ? 'video' : 'photo',
    });

    if (res.didCancel || !res.assets) {
      throw makeError(FileManagerErrorCode.PICKER_CANCELLED, fileSource, res);
    }

    const asset = res.assets[0];
    const ext = getExtSafe(asset.fileName) ?? (mode === 'video' ? 'mp4' : 'jpg');

    if (!asset.uri) {
      throw makeError(FileManagerErrorCode.FILE_COPY_FAILED, fileSource, asset);
    }

    // VIDEO
    if (mode === 'video') {
      const filename = `${moment().format('YYYYMMDD-HHmmss')}.${ext}`;
      const dest = `${RNFS.CachesDirectoryPath}/${filename}`;

      try {
        await RNFS.copyFile(asset.uri, dest);
      } catch (err) {
        throw makeError(FileManagerErrorCode.FILE_COPY_FAILED, fileSource, err);
      }

      callback([
        new LocalFile(
          {
            fileName: filename,
            fileSize: asset.fileSize ?? 0,
            height: asset.height ?? 0,
            name: filename,
            originalPath: asset.uri,
            type: fallbackMime(asset.type, filename),
            uri: 'file://' + dest,
            width: asset.width ?? 0,
          },
          { _needIOSReleaseSecureAccess: false },
        ),
      ]);

      return;
    }

    // PHOTO
    let processed;
    try {
      processed = await processImage(asset);
    } catch (err) {
      throw makeError(FileManagerErrorCode.IMAGE_PROCESSING_FAILED, fileSource, err);
    }

    if (!processed) {
      throw makeError(FileManagerErrorCode.IMAGE_PROCESSING_FAILED, fileSource, asset);
    }

    callback([new LocalFile(processed, { _needIOSReleaseSecureAccess: false })]);
  });
}

/* ---------------------------------------------
 * DOCUMENTS
 * --------------------------------------------- */

export function pickFromDocuments(
  options: {
    multiple?: boolean;
    types?: string[];
  } = {},
): Promise<LocalFile[]> {
  const { multiple = true, types: customTypes } = options;
  const fileSource: FileSource = 'documents';

  return wrapPicker(async callback => {
    const docs = await pick({
      allowMultiSelection: multiple,
      copyTo: 'cachesDirectory',
      type: customTypes ?? [types.allFiles],
    });

    if (!docs || docs.length === 0) {
      throw makeError(FileManagerErrorCode.PICKER_CANCELLED, fileSource, docs);
    }

    const files = docs.map(file => {
      const uri = Platform.OS === 'android' ? getPath(file.uri) : decodeURI(file.uri.replace(/^file:\/\//, ''));

      const mime = file.type && file.type !== 'null' ? file.type : guessMimeFromExt(getExtSafe(file.name));

      return new LocalFile(
        {
          fileName: safe(file.name) ?? 'file',
          fileSize: file.size ?? 0,
          type: mime,
          uri,
        },
        { _needIOSReleaseSecureAccess: false },
      );
    });

    callback(files);
  });
}

/* ---------------------------------------------
 * AUDIO
 * --------------------------------------------- */

export function pickAudio(
  options: {
    multiple?: boolean;
    types?: string[];
  } = {},
): Promise<LocalFile[]> {
  const { multiple = true, types: customTypes = ['audio/*'] } = options;
  const fileSource: FileSource = 'audio';

  return wrapPicker(async callback => {
    const docs = await pick({
      allowMultiSelection: multiple,
      copyTo: 'cachesDirectory',
      type: customTypes,
    });

    if (!docs || docs.length === 0) {
      throw makeError(FileManagerErrorCode.PICKER_CANCELLED, fileSource, docs);
    }

    const files = docs.map(file => {
      const uri = Platform.OS === 'android' ? getPath(file.uri) : decodeURI(file.uri.replace(/^file:\/\//, ''));

      return new LocalFile(
        {
          fileName: safe(file.name) ?? 'audio',
          fileSize: file.size ?? 0,
          type: fallbackMime(file.type, file.name),
          uri,
        },
        { _needIOSReleaseSecureAccess: false },
      );
    });

    callback(files);
  });
}
