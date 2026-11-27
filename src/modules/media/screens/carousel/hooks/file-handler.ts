import * as React from 'react';
import { Alert, Platform } from 'react-native';

import getPath from '@flyerhq/react-native-android-uri-path';
import RNFS, { DownloadProgressCallbackResult } from 'react-native-fs';
import Share from 'react-native-share';

import Toast from '~/framework/components/toast';
import AppInfo from '~/framework/util/app-info';
import { LocalFile, SyncedFile } from '~/framework/util/fileHandler';
import fileTransferService from '~/framework/util/fileHandler/service';
import { PermissionError } from '~/framework/util/permissions';
import { assertSession } from '~/modules/auth/store/accounts';
import { FileMedia } from '~/modules/media/types';
import { I18n } from '~/util/i18n';

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
