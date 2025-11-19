import { Alert, Platform } from 'react-native';

import ImageResizer, { Response } from '@bam.tech/react-native-image-resizer';
import getPath from '@flyerhq/react-native-android-uri-path';
import { DocumentPickerResponse, pick, types } from '@react-native-documents/picker';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';
import ImagePicker, { ImageOrVideo } from 'react-native-image-crop-picker';

import { I18n } from '~/app/i18n';
import toast from '~/framework/components/toast';
import { LocalFile } from '~/framework/util/fileHandler/models/localFile';
import { Asset } from '~/framework/util/fileHandler/types';
import { assertPermissions } from '~/framework/util/permissions';
/* -------------------------------------------------------
 * Utilities
 * ------------------------------------------------------- */

const IMAGE_MAX_DIMENSION = 1440;
const IMAGE_MAX_QUALITY = 80;

/** Compress / resize selected image */
async function processImage(pic: ImageOrVideo): Promise<Asset | undefined> {
  try {
    const response: Response = await ImageResizer.createResizedImage(
      pic.path,
      IMAGE_MAX_DIMENSION,
      IMAGE_MAX_DIMENSION,
      'JPEG',
      IMAGE_MAX_QUALITY,
      0,
      undefined,
      false,
      { mode: 'contain', onlyScaleDown: false },
    );

    return {
      ...response,
      fileName: `${moment().format('YYYYMMDD-HHmmss')}.jpg`,
      fileSize: response.size,
      name: `${moment().format('YYYYMMDD-HHmmss')}.jpg`,
      originalPath: response.path,
      type: 'image/jpeg',
    };
  } catch (err) {
    console.error('Image resizing failed:', err);
  }
}

/** Wrap old-style callback API into Promise<LocalFile[]> */
function wrapPicker(fn: (callback: (files: LocalFile[] | LocalFile) => void) => void): Promise<LocalFile[]> {
  return new Promise(resolve => {
    fn(files => {
      const list = Array.isArray(files) ? files : [files];
      resolve(list);
    });
  });
}

/* -------------------------------------------------------
 * Gallery Picker
 * ------------------------------------------------------- */
export function pickFromGallery(
  options: {
    multiple?: boolean;
    callbackOnce?: boolean;
    allowedTypes?: Array<'image' | 'video'>;
  } = {},
): Promise<LocalFile[]> {
  const { allowedTypes = ['image'], callbackOnce = true, multiple = true } = options;

  return wrapPicker(async callback => {
    try {
      await assertPermissions('galery.read');

      console.debug('[Gallery] allowedTypes =', allowedTypes);

      // MEDIA TYPE DECISION
      const hasImage = allowedTypes.includes('image');
      const hasVideo = allowedTypes.includes('video');

      let mediaType: 'photo' | 'video' | 'any' = 'photo';
      if (hasImage && hasVideo) mediaType = 'any';
      else if (!hasImage && hasVideo) mediaType = 'video';

      console.debug('[Gallery] Using mediaType =', mediaType);

      const pics = await ImagePicker.openPicker({
        maxFiles: 999,
        mediaType,
        multiple,
      });

      const ordered = Array.isArray(pics)
        ? pics.sort((a, b) =>
            !a.modificationDate ? -1 : !b.modificationDate ? 1 : a.modificationDate.localeCompare(b.modificationDate),
          )
        : [pics];

      console.debug('[Gallery] Ordered items:', ordered);

      const assets = await Promise.all(
        ordered.map(async item => {
          // VIDEO
          if (item.mime?.startsWith('video/')) {
            console.debug('[Gallery] Video detected → copying locally:', item.path);

            const ext = item.mime.split('/')[1] || 'mp4';
            const filename = `${moment().format('YYYYMMDD-HHmmss')}.${ext}`;
            const dest = `${RNFS.CachesDirectoryPath}/${filename}`;

            try {
              await RNFS.copyFile(item.path, dest);
            } catch (err) {
              console.error('[Gallery] Failed to copy video locally:', err);
              return null;
            }

            return {
              duration: item.duration,
              fileName: filename,
              fileSize: item.size,
              height: item.height,
              name: filename,
              originalPath: item.path,
              type: item.mime,
              uri: 'file://' + dest,
              width: item.width,
            } as Asset;
          }

          // IMAGE
          return await processImage(item);
        }),
      );

      const validAssets = assets.filter(Boolean) as Asset[];
      console.debug('[Gallery] Assets after processing:', validAssets);

      const localFiles = validAssets.map(a => new LocalFile(a, { _needIOSReleaseSecureAccess: false }));
      console.debug('[Gallery] LocalFile list:', localFiles);

      if (callbackOnce) callback(localFiles);
      else for (const file of localFiles) callback(file);
    } catch (e: any) {
      if (e?.code === 'E_PICKER_CANCELLED') {
        console.debug('[Gallery] Picker cancelled');
        callback([]);
        return;
      }

      console.error('[GalleryPicker] Error:', e);
      toast.showError(
        I18n.get('gallery-readpermissionblocked-text', {
          appName: DeviceInfo.getApplicationName(),
        }),
      );
    }
  });
}

/* -------------------------------------------------------
 * Camera Picker
 * ------------------------------------------------------- */
export function pickFromCamera(
  options: {
    useFrontCamera?: boolean;
    callbackOnce?: boolean;
  } = {},
): Promise<LocalFile[]> {
  const { callbackOnce = true, useFrontCamera = false } = options;

  return wrapPicker(async callback => {
    try {
      await assertPermissions('camera');

      const pic = await ImagePicker.openCamera({ useFrontCamera });
      const asset = await processImage(pic);

      if (!asset) {
        callback([]);
        return;
      }

      const file = new LocalFile(asset, { _needIOSReleaseSecureAccess: false });

      if (callbackOnce) callback([file]);
      else callback(file);
    } catch (e: any) {
      if (e?.code === 'E_PICKER_CANCELLED') {
        callback([]);
        return;
      }

      toast.showError(
        I18n.get('gallery-readpermissionblocked-text', {
          appName: DeviceInfo.getApplicationName(),
        }),
      );
    }
  });
}

/* -------------------------------------------------------
 * Documents Picker
 * ------------------------------------------------------- */
export function pickFromDocuments(
  options: {
    callbackOnce?: boolean;
  } = {},
): Promise<LocalFile[]> {
  const { callbackOnce = true } = options;

  return wrapPicker(async callback => {
    try {
      const docs = await pick({
        allowMultiSelection: true,
        copyTo: 'cachesDirectory',
        presentationStyle: 'fullScreen',
        type: [types.allFiles],
      });

      if (!docs || docs.length === 0) {
        callback([]);
        return;
      }

      const files = docs.map((file: DocumentPickerResponse) => {
        const uri = Platform.select({
          android: getPath(file.uri),
          default: decodeURI(file.uri.startsWith('file://') ? file.uri.replace('file://', '') : file.uri),
        })!;

        return new LocalFile(
          {
            fileName: file.name!,
            fileSize: file.size!,
            type: file.type!,
            uri,
          },
          { _needIOSReleaseSecureAccess: false },
        );
      });

      if (callbackOnce) callback(files);
      else for (const f of files) callback(f);
    } catch (e: any) {
      console.error('[DOC_PICKER] Error:', e);

      if (e?.code === 'CANCELLED' || e?.message?.includes('cancel')) {
        callback([]);
        return;
      }

      Alert.alert(
        I18n.get('document-permissionblocked-title'),
        I18n.get('document-permissionblocked-text', {
          appName: DeviceInfo.getApplicationName(),
        }),
      );
    }
  });
}
