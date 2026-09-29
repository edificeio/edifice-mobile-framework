import * as React from 'react';
import { Alert, Platform } from 'react-native';

import getPath from '@flyerhq/react-native-android-uri-path';
import { CameraRoll, SaveToCameraRollOptions } from '@react-native-camera-roll/camera-roll';
import DeviceInfo from 'react-native-device-info';
import RNFS, { DownloadProgressCallbackResult } from 'react-native-fs';
import Share from 'react-native-share';

import { I18n } from '~/util/i18n';
import Toast from '~/framework/components/toast';
import { assertSession } from '~/framework/modules/auth/redux/reducer';
import { FileMedia } from '~/framework/modules/media';
import { LocalFile, SyncedFile } from '~/framework/util/fileHandler';
import fileTransferService from '~/framework/util/fileHandler/service';
import { assertPermissions, PermissionError, PermissionScenario } from '~/framework/util/permissions';

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
      I18n.get('carousel-savetocameraroll-permissionblocked-text', { appName: DeviceInfo.getApplicationName() }),
    );
    return false;
  }
};

// On Android, gallery items are saved in the 'Download' album.
const saveToGallery = (filePath: string, isVideo: boolean) => {
  const options: SaveToCameraRollOptions = { type: 'photo' };
  if (isVideo) options.type = 'video';
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

// media.src can be a URL, a string, or an object with a `uri` property (ImageURISource / ReactVideoSource).
// Using .toString() on an object gives '[object Object]', so extract the URI string explicitly.
const getMediaSrcString = (src: FileMedia['src']): string => {
  if (src instanceof URL) return src.href;
  if (typeof src === 'string') return src;
  return (src as { uri?: string }).uri ?? '';
};

export const useFileHandler = (media: FileMedia | undefined, onProgress?: (res: DownloadProgressCallbackResult) => void) => {
  const jobIdRef = React.useRef<number | null>(null);
  const isCancelledRef = React.useRef(false);

  const cancelDownload = React.useCallback(() => {
    if (isCancelledRef.current) return;
    isCancelledRef.current = true;
    if (jobIdRef.current !== null && jobIdRef.current !== 0) {
      RNFS.stopDownload(jobIdRef.current);
    }
  }, []);

  const downloadFile = React.useCallback(
    async (realUrl: string) => {
      try {
        const job = await fileTransferService.startDownloadFile(
          assertSession(),
          { filetype: media!.mime, url: realUrl },
          {},
          { onProgress },
        );
        jobIdRef.current = job.jobId;
        if (isCancelledRef.current && job.jobId !== 0) {
          RNFS.stopDownload(job.jobId);
        }
        const syncedFile = await job.promise;

        return syncedFile;
      } catch (e) {
        console.error('Error in downloadFile:', e);
        throw e;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [media],
  );

  const getSyncedFile = React.useCallback(async () => {
    let syncedFile;
    const stringSrc = getMediaSrcString(media!.src);

    if (stringSrc.includes('file://')) {
      syncedFile = new SyncedFile(
        new LocalFile(
          { filename: stringSrc.split('/').pop() ?? '', filepath: stringSrc, filetype: media!.mime },
          { _needIOSReleaseSecureAccess: false },
        ),
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
      if (isCancelledRef.current) return;
      const effectiveMime = syncedFile.filetype || media.mime;
      const isVideo = !!effectiveMime?.startsWith('video/');
      const isImage = !!effectiveMime?.startsWith('image/');
      const isGalleryContent = isVideo || isImage;

      let permissionType: PermissionScenario = 'documents.write';
      if (isGalleryContent) permissionType = 'gallery.write';
      const hasPermission = await ensureSavePermission(permissionType);
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
    } catch (e) {
      if (isCancelledRef.current) return;
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

  return { cancelDownload, isCancelledRef, onSave, onShare };
};
