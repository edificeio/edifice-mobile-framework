import { Alert, Platform } from 'react-native';

import ImageResizer, { Response } from '@bam.tech/react-native-image-resizer';
import getPath from '@flyerhq/react-native-android-uri-path';
import { DocumentPickerResponse, pick, types } from '@react-native-documents/picker';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
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
  } = {},
): Promise<LocalFile[]> {
  const { callbackOnce = true, multiple = true } = options;

  return wrapPicker(async callback => {
    try {
      await assertPermissions('galery.read');

      const pics = await ImagePicker.openPicker({
        maxFiles: 999,
        mediaType: 'photo',
        multiple,
      });

      const ordered = Array.isArray(pics)
        ? pics.sort((a, b) =>
            !a.modificationDate ? -1 : !b.modificationDate ? 1 : a.modificationDate.localeCompare(b.modificationDate),
          )
        : [pics];

      const assets = (await Promise.all(ordered.map(processImage))).filter(Boolean) as Asset[];

      const localFiles = assets.map(a => new LocalFile(a, { _needIOSReleaseSecureAccess: false }));

      // Remove videos on Android / warning
      if (Platform.OS === 'android') {
        localFiles.forEach(file => {
          if (file.filetype.startsWith('video/')) {
            toast.showError(I18n.get('pickfile-error-filetype'));
          }
        });
      }

      const images = localFiles.filter(f => !f.filetype.startsWith('video/'));

      if (callbackOnce) callback(images);
      else for (const img of images) callback(img);
    } catch (e: any) {
      if (e?.code === 'E_PICKER_CANCELLED') {
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
