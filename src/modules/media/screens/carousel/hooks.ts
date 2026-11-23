import * as React from 'react';
import { Alert, Platform } from 'react-native';

import getPath from '@flyerhq/react-native-android-uri-path';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNFS, { DownloadProgressCallbackResult } from 'react-native-fs';
import Orientation, {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  OrientationLockerProps,
  OrientationType,
  PORTRAIT,
} from 'react-native-orientation-locker';
import { SharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Share from 'react-native-share';

import { useNavigation } from '~/app/navigation-new';
import Toast from '~/framework/components/toast';
import AppInfo from '~/framework/util/app-info';
import { LocalFile, SyncedFile } from '~/framework/util/fileHandler';
import fileTransferService from '~/framework/util/fileHandler/service';
import { assertPermissions, PermissionError } from '~/framework/util/permissions';
import { assertSession } from '~/modules/auth/store/accounts';
import { FileMedia, isEmbeddedMedia, isPlayableMedia } from '~/modules/media/types';
import { I18n } from '~/util/i18n';

import { PAGINATION_ANIMATION_DURATION, PAGINATION_ANIMATION_OFFSET } from './screen';

const isAndroid = Platform.OS === 'android';

export const useCarouselFileHandler = (
  media: FileMedia | undefined,
  onProgress?: (res: DownloadProgressCallbackResult) => void,
) => {
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
          onProgress ? { onProgress } : undefined,
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
    // media.src can be URL, string, or an object with a `uri` property (ImageURISource / ReactVideoSource).
    // Using .toString() on an object gives '[object Object]', so extract the URI string explicitly.
    const rawSrc = media!.src;
    const stringSrc =
      rawSrc instanceof URL ? rawSrc.href : typeof rawSrc === 'string' ? rawSrc : ((rawSrc as { uri?: string }).uri ?? '');

    if (stringSrc.indexOf('file://') > -1) {
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

  /** Downloads the media (copied as is if it already is a local file). Gives `undefined` if cancelled, throws if it fails. */
  const download = React.useCallback(async (): Promise<SyncedFile | undefined> => {
    if (!media) throw new Error('[Carousel] no media provided');
    const syncedFile = await getSyncedFile();
    return isCancelledRef.current ? undefined : syncedFile;
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
          I18n.get('carousel-share-permissionblocked-text', { appName: AppInfo.app.name }),
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

  return { cancelDownload, download, isCancelledRef, onShare };
};

/**
 * Saves a downloaded media on the device: the gallery for images and videos, the downloads (Android) or the files (iOS, through the
 * share sheet) for the others. Tells the user when it is done. Throws if it fails, except for a blocked permission (an alert tells it).
 */
const saveToDevice = async (syncedFile: SyncedFile, media: FileMedia) => {
  const effectiveMime = syncedFile.filetype || media.mime;
  const isVideo = effectiveMime?.startsWith('video/');
  const isImage = effectiveMime?.startsWith('image/');
  const isGalleryContent = isVideo || isImage;
  const permissionType = isGalleryContent ? 'gallery.write' : 'documents.write';

  try {
    await assertPermissions(permissionType);
  } catch (e) {
    if (e instanceof PermissionError) {
      Alert.alert(
        I18n.get('carousel-savetocameraroll-permissionblocked-title'),
        I18n.get('carousel-savetocameraroll-permissionblocked-text', {
          appName: AppInfo.app.name,
        }),
      );
      return;
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
      await CameraRoll.saveAsset(realFilePath, { album: 'Download', type: isVideo ? 'video' : 'photo' });
    } else {
      await CameraRoll.saveAsset(realFilePath, { type: isVideo ? 'video' : 'photo' });
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

const PAGINATION_ANIMATION_DELAY = 300;

export const useTogglePagination = (
  media: FileMedia[],
  paginationTranslateY: SharedValue<number>,
  setIsPaginationVisible: (visible: boolean) => void,
) => {
  const togglePaginationComponent = React.useCallback(
    (index: number, previousIndex: number) => {
      const currentIsPlayable = isPlayableMedia(media[index]);
      const previousIsPlayable = isPlayableMedia(media[previousIndex]);
      const currentIsEmbedded = isEmbeddedMedia(media[index]) || (media[index].type as string) === 'iframe';
      const previousIsEmbedded = isEmbeddedMedia(media[previousIndex]) || (media[previousIndex].type as string) === 'iframe';

      const shouldHidePagination = currentIsPlayable || currentIsEmbedded;
      const previousWasHidden = previousIsPlayable || previousIsEmbedded;

      if (shouldHidePagination) {
        if (previousWasHidden) {
          paginationTranslateY.value = PAGINATION_ANIMATION_OFFSET;
          setIsPaginationVisible(false);
        } else {
          paginationTranslateY.value = 0;
          paginationTranslateY.value = withDelay(
            PAGINATION_ANIMATION_DELAY,
            withTiming(PAGINATION_ANIMATION_OFFSET, { duration: PAGINATION_ANIMATION_DURATION }),
          );
          setIsPaginationVisible(true);
        }
      } else {
        paginationTranslateY.value = withTiming(0, { duration: PAGINATION_ANIMATION_DURATION });
        setIsPaginationVisible(true);
      }
    },
    [media, paginationTranslateY, setIsPaginationVisible],
  );

  return togglePaginationComponent;
};

export const useCarouselOrientation = () => {
  const [orientation, setOrientation] = React.useState<OrientationLockerProps['orientation']>(PORTRAIT);

  const onOrientationChange = React.useCallback((newOrientation: OrientationType) => {
    if (newOrientation === 'PORTRAIT') setOrientation(PORTRAIT);
    else if (newOrientation === 'LANDSCAPE-LEFT') setOrientation(LANDSCAPE_LEFT);
    else if (newOrientation === 'LANDSCAPE-RIGHT') setOrientation(LANDSCAPE_RIGHT);
  }, []);

  // Lock to portrait when leaving carousel
  React.useEffect(() => {
    return () => {
      Orientation.lockToPortrait();
    };
  }, []);

  return { onOrientationChange, orientation };
};
