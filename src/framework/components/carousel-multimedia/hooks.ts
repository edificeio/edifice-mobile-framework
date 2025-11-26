import * as React from 'react';
import { Alert, Platform } from 'react-native';

import getPath from '@flyerhq/react-native-android-uri-path';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

import { I18n } from '~/app/i18n';
import Toast from '~/framework/components/toast';
import { assertSession } from '~/framework/modules/auth/reducer';
import { LocalFile, SyncedFile } from '~/framework/util/fileHandler';
import fileTransferService from '~/framework/util/fileHandler/service';
import { FileMedia, isImageContent, isVideoContent } from '~/framework/util/media';
import { assertPermissions, PermissionError } from '~/framework/util/permissions';

const isAndroid = Platform.OS === 'android';

export const useCarouselFileHandler = (media: FileMedia | undefined) => {
  const downloadFile = React.useCallback(
    async (realUrl: string) => {
      await assertPermissions('gallery.write');
      const syncedFile = await fileTransferService.downloadFile(assertSession(), { filetype: media!.mime, url: realUrl }, {});

      return syncedFile;
    },
    [media],
  );

  const getSyncedFile = React.useCallback(async () => {
    let syncedFile;
    const stringSrc = media!.src.toString();

    if (stringSrc.indexOf('file://') > -1) {
      syncedFile = new SyncedFile(
        new LocalFile({ filename: '', filepath: media!.src, filetype: media!.mime }, { _needIOSReleaseSecureAccess: false }),
        { url: stringSrc },
      );
    } else {
      syncedFile = await downloadFile(stringSrc);
    }

    return syncedFile;
  }, [media, downloadFile]);

  const onSave = React.useCallback(async () => {
    try {
      if (!media) throw new Error('[Carousel] no media provided');
      const syncedFile = await getSyncedFile();
      const isGalleryContent = isImageContent(media) || isVideoContent(media);
      const permissionType = isGalleryContent ? 'gallery.write' : 'documents.write';

      try {
        await assertPermissions(permissionType);
      } catch (e) {
        if (e instanceof PermissionError) {
          Alert.alert(
            I18n.get('carousel-savetocameraroll-permissionblocked-title'),
            I18n.get('carousel-savetocameraroll-permissionblocked-text', {
              appName: DeviceInfo.getApplicationName(),
            }),
          );
          return undefined;
        } else {
          throw e;
        }
      }

      const realFilePath = Platform.select({
        android: getPath(syncedFile.filepath),
        default: decodeURI(syncedFile.filepath),
      });

      if (isGalleryContent) {
        if (isAndroid) {
          await CameraRoll.saveAsset(realFilePath, { album: 'Download' });
        } else {
          await CameraRoll.saveAsset(realFilePath);
        }
      } else {
        if (isAndroid) {
          await syncedFile.moveToDownloadFolder();
        } else {
          await Share.open({
            failOnCancel: false,
            message: syncedFile.filename,
            saveToFiles: true,
            type: syncedFile.filetype,
            url: `file://${syncedFile.filepath}`,
          });
        }
      }

      isGalleryContent
        ? Toast.showSuccess(I18n.get('carousel-savetocameraroll-success'))
        : isAndroid
          ? Toast.showSuccess(I18n.get('carousel-savetodownloads-success'))
          : Toast.showSuccess(I18n.get('carousel-save-success'));
    } catch (e) {
      console.error(`Fail saving from Carousel: `, e);
      Toast.showError(I18n.get('carousel-savetocameraroll-error'));
    }
  }, [media, getSyncedFile]);

  const onShare = React.useCallback(async () => {
    let destinationPath: string | null = null;
    try {
      if (!media) throw new Error('[Carousel] no media provided');
      const syncedFile = await getSyncedFile();
      const fileExtension = syncedFile.filepath.split('.').pop();
      const sourceFilePath = Platform.select({
        android: getPath(syncedFile.filepath),
        default: decodeURI(syncedFile.filepath),
      });

      destinationPath = `${RNFS.CachesDirectoryPath}/share-${Date.now()}.${fileExtension}`;
      await RNFS.copyFile(sourceFilePath, destinationPath);

      await Share.open({
        failOnCancel: false,
        showAppsToView: true,
        type: syncedFile.filetype,
        url: `file://${destinationPath}`,
      });
    } catch (e) {
      if (e instanceof PermissionError) {
        Alert.alert(
          I18n.get('carousel-share-permissionblocked-title'),
          I18n.get('carousel-share-permissionblocked-text', { appName: DeviceInfo.getApplicationName() }),
        );
      } else {
        console.error('Fail sharing from Carousel:', e);
        Toast.showError(I18n.get('carousel-share-error'));
      }
    } finally {
      if (destinationPath) {
        try {
          await RNFS.unlink(destinationPath);
        } catch (cleanupErr) {
          console.warn('Could not clean up temp share file', cleanupErr);
        }
      }
    }
  }, [media, getSyncedFile]);

  return { onSave, onShare };
};
