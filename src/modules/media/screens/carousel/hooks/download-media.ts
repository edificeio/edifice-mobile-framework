import * as React from 'react';
import { Alert, Platform } from 'react-native';

import getPath from '@flyerhq/react-native-android-uri-path';
import { CameraRoll, type SaveToCameraRollOptions } from '@react-native-camera-roll/camera-roll';
import Share from 'react-native-share';

import { useNavigation } from '~/app/navigation-new';
import Toast from '~/framework/components/toast';
import AppInfo from '~/framework/util/app-info';
import type { SyncedFile } from '~/framework/util/fileHandler';
import { assertPermissions, PermissionError, type PermissionScenario } from '~/framework/util/permissions';
import { FileMedia } from '~/modules/media/types';
import { I18n } from '~/util/i18n';

const isAndroid = Platform.OS === 'android';

// Returns false (after alerting the user) when the permission is blocked; rethrows any other error.
const ensureSavePermission = async (permissionType: PermissionScenario): Promise<boolean> => {
  try {
    await assertPermissions(permissionType);
    return true;
  } catch (e) {
    if (!(e instanceof PermissionError)) throw e;
    Alert.alert(
      I18n.get('carousel-savetocameraroll-permissionblocked-title'),
      I18n.get('carousel-savetocameraroll-permissionblocked-text', { appName: AppInfo.app.name }),
    );
    return false;
  }
};

// On Android, gallery items are saved in the 'Download' album.
const saveToGallery = (filePath: string, isVideo: boolean) => {
  const options: SaveToCameraRollOptions = { type: isVideo ? 'video' : 'photo' };
  if (isAndroid) options.album = 'Download';
  return CameraRoll.saveAsset(filePath, options);
};

// Android: move to the Downloads folder. iOS: share sheet with "Save to Files".
const saveToDocuments = (syncedFile: SyncedFile) => {
  if (isAndroid) return syncedFile.moveToDownloadFolder();
  return Share.open({
    failOnCancel: false,
    message: syncedFile.filename,
    saveToFiles: true,
    type: syncedFile.filetype,
    url: `file://${syncedFile.filepath}`,
  });
};

const getSaveSuccessI18nKey = (isGalleryContent: boolean) => {
  if (isGalleryContent) return 'carousel-savetocameraroll-success';
  if (isAndroid) return 'carousel-savetodownloads-success';
  return 'carousel-save-success';
};

/**
 * Saves a downloaded media on the device: the gallery for images and videos, the downloads (Android) or the files (iOS, through the
 * share sheet) for the others. Tells the user when it is done. Throws if it fails, except for a blocked permission (an alert tells it).
 */
const saveToDevice = async (syncedFile: SyncedFile, media: FileMedia) => {
  const effectiveMime = syncedFile.filetype || media.mime;
  const isVideo = !!effectiveMime?.startsWith('video/');
  const isImage = !!effectiveMime?.startsWith('image/');
  const isGalleryContent = isVideo || isImage;

  const hasPermission = await ensureSavePermission(isGalleryContent ? 'gallery.write' : 'documents.write');
  if (!hasPermission) return;

  if (isGalleryContent) {
    const realFilePath = Platform.select({
      android: getPath(syncedFile.filepath),
      default: decodeURI(syncedFile.filepath),
    });
    await saveToGallery(realFilePath, isVideo);
  } else {
    await saveToDocuments(syncedFile);
  }
  Toast.showSuccess(I18n.get(getSaveSuccessI18nKey(isGalleryContent)));
};

/**
 * Downloads a media on the device: the download modal (progress, cancel) gives the file, then it is saved (see `saveToDevice`).
 * Saved once the modal is unmounted: the share sheet or the permission alert are not shown over it.
 * @returns `downloadMedia(media)`. Errors are told to the user, the cancellation does nothing.
 */
export const useDownloadMedia = () => {
  const navigation = useNavigation();
  return React.useCallback(
    async (media: FileMedia) => {
      try {
        const syncedFile = await navigation.navigateAsync('media/download', { media });
        if (syncedFile) await saveToDevice(syncedFile, media);
      } catch (e) {
        console.error('Fail saving from Carousel: ', e);
        Toast.showError(I18n.get('carousel-savetocameraroll-error'));
      }
    },
    [navigation],
  );
};
