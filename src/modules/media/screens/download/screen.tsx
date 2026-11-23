import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { defineModal, type ScreenPromiseParams, useScreenPromise } from '~/app/navigation-new';
import theme from '~/app/theme';
import { BodyBoldText, SmallBoldText } from '~/framework/components/text';
import type { SyncedFile } from '~/framework/util/fileHandler';
import { useCarouselFileHandler } from '~/modules/media/screens/carousel/hooks';
import type { FileMedia } from '~/modules/media/types';
import { I18n } from '~/util/i18n';

import styles from './styles';

export type MediaDownloadParams = {
  media: FileMedia;
};

/**
 * Downloads a media, showing the progress. Gives the downloaded file to `navigateAsync` (see `useDownloadMedia`), `undefined` if the
 * user cancels; rejects if the download fails. What to do with the file is up to the screen that opened it.
 */
const DownloadModal = ({ route }: StaticScreenProps<ScreenPromiseParams<MediaDownloadParams, SyncedFile | undefined>>) => {
  const { reject, resolve } = useScreenPromise(route);
  const { media } = route.params;
  const [progress, setProgress] = React.useState(0);

  const { cancelDownload, download, isCancelledRef } = useCarouselFileHandler(media, res => {
    if (res.contentLength > 0) setProgress(res.bytesWritten / res.contentLength);
  });

  React.useEffect(() => {
    // Once cancelled, the outcome is the one of the cancellation: the end of the download (stopped, it may fail) is ignored.
    const startDownload = async () => {
      try {
        const syncedFile = await download();
        if (!isCancelledRef.current) resolve(syncedFile);
      } catch (e) {
        if (!isCancelledRef.current) reject(e);
      }
    };
    startDownload();

    return () => {
      cancelDownload();
    };
    // The download starts once, when the modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCancel = React.useCallback(() => {
    cancelDownload();
    resolve(undefined);
  }, [cancelDownload, resolve]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <BodyBoldText style={styles.title}>{I18n.get('media-download-inprogress')}</BodyBoldText>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
        <View style={styles.separator} />
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton} testID="media-download-cancel">
          <SmallBoldText style={{ color: theme.palette.status.failure.regular }}>{I18n.get('common-cancel')}</SmallBoldText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default defineModal({
  options: () => ({ headerShown: false, presentation: 'transparentModal' }),
  screen: DownloadModal,
});
