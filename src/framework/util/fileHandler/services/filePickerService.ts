import { Alert, Platform } from 'react-native';

import getPath from '@flyerhq/react-native-android-uri-path';
import { pick, types } from '@react-native-documents/picker';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { I18n } from '~/app/i18n';
import { LocalFile } from '~/framework/util/fileHandler/models/localFile';
import { Asset } from '~/framework/util/fileHandler/types';
import { fallbackMime, getExtSafe, processImage, safe, wrapPicker } from '~/framework/util/fileHandler/utils';

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

  const mediaType: 'photo' | 'video' | 'mixed' = hasImage && hasVideo ? 'mixed' : hasVideo ? 'video' : 'photo';

  return wrapPicker(async callback => {
    try {
      const res = await launchImageLibrary({
        includeExtra: true,
        mediaType,
        selectionLimit: multiple ? 0 : 1,
      });

      if (res.didCancel || !res.assets) return callback([]);

      const processed = await Promise.all(
        res.assets.map(async item => {
          const ext = getExtSafe(item.fileName) ?? 'mp4';

          if (item.type?.startsWith('video/')) {
            const filename = `${moment().format('YYYYMMDD-HHmmss')}.${ext}`;
            const dest = `${RNFS.CachesDirectoryPath}/${filename}`;

            try {
              await RNFS.copyFile(item.uri!, dest);
            } catch (err) {
              console.error('[Gallery] Copy video error:', err);
              return null;
            }

            return {
              duration: item.duration,
              fileName: filename,
              fileSize: item.fileSize ?? 0,
              height: item.height ?? 0,
              name: filename,
              originalPath: item.uri!,
              type: fallbackMime(item.type, filename),
              uri: 'file://' + dest,
              width: item.width ?? 0,
            } as Asset;
          }

          return await processImage(item);
        }),
      );

      callback(processed.filter(Boolean).map(a => new LocalFile(a!, { _needIOSReleaseSecureAccess: false })));
    } catch (err) {
      console.error('[pickFromGallery] ERROR:', err);
      callback([]);
    }
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

  return wrapPicker(async callback => {
    try {
      const res = await launchCamera({
        cameraType: useFrontCamera ? 'front' : 'back',
        includeExtra: true,
        mediaType: mode === 'video' ? 'video' : 'photo',
      });

      if (res.didCancel || !res.assets) return callback([]);

      const asset = res.assets[0];
      const ext = getExtSafe(asset.fileName) ?? (mode === 'video' ? 'mp4' : 'jpg');

      if (mode === 'video') {
        const filename = `${moment().format('YYYYMMDD-HHmmss')}.${ext}`;
        const dest = `${RNFS.CachesDirectoryPath}/${filename}`;
        await RNFS.copyFile(asset.uri!, dest);

        return callback([
          new LocalFile(
            {
              fileName: filename,
              fileSize: asset.fileSize ?? 0,
              height: asset.height ?? 0,
              name: filename,
              originalPath: asset.uri!,
              type: fallbackMime(asset.type, filename),
              uri: 'file://' + dest,
              width: asset.width ?? 0,
            },
            { _needIOSReleaseSecureAccess: false },
          ),
        ]);
      }

      const processed = await processImage(asset);
      if (!processed) return callback([]);

      callback([new LocalFile(processed, { _needIOSReleaseSecureAccess: false })]);
    } catch (err) {
      console.error('[pickFromCamera] ERROR:', err);
      callback([]);
    }
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

  return wrapPicker(async callback => {
    try {
      const docs = await pick({
        allowMultiSelection: multiple,
        copyTo: 'cachesDirectory',
        type: customTypes ?? [types.allFiles],
      });

      if (!docs || docs.length === 0) return callback([]);

      const files = docs.map(file => {
        const uri = Platform.OS === 'android' ? getPath(file.uri) : decodeURI(file.uri.replace(/^file:\/\//, ''));

        return new LocalFile(
          {
            fileName: safe(file.name) ?? 'file',
            fileSize: file.size ?? 0,
            type: fallbackMime(file.type, file.name),
            uri,
          },
          { _needIOSReleaseSecureAccess: false },
        );
      });

      callback(files);
    } catch (err) {
      const e = err as any;

      if (e?.code !== 'CANCELLED') {
        Alert.alert(
          I18n.get('documents-read-permissionblocked-title'),
          I18n.get('documents-read-permissionblocked-text', {
            appName: DeviceInfo.getApplicationName(),
          }),
        );
      }

      callback([]);
    }
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

  return wrapPicker(async callback => {
    try {
      const docs = await pick({
        allowMultiSelection: multiple,
        copyTo: 'cachesDirectory',
        type: customTypes,
      });

      if (!docs || docs.length === 0) return callback([]);

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
    } catch (err) {
      console.error('[pickAudio] ERROR:', err);
      callback([]);
    }
  });
}
