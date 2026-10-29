import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';

import { defineModal } from '~/app/navigation-new';
import theme from '~/app/theme';
import { BodyBoldText, SmallBoldText } from '~/framework/components/text';
import { useCarouselFileHandler } from '~/modules/media/screens/carousel/hooks';
import type { FileMedia } from '~/modules/media/types';
import { I18n } from '~/util/i18n';

import styles from './styles';

export type MediaDownloadParams = {
  media: FileMedia;
};

const DownloadModal = ({ route }: StaticScreenProps<MediaDownloadParams>) => {
  const navigation = useNavigation();
  const { media } = route.params;
  const [progress, setProgress] = React.useState(0);

  const { cancelDownload, isCancelledRef, onSave } = useCarouselFileHandler(media, res => {
    if (res.contentLength > 0) setProgress(res.bytesWritten / res.contentLength);
  });

  React.useEffect(() => {
    const startDownload = async () => {
      await onSave();
      if (!isCancelledRef.current) navigation.goBack();
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
    navigation.goBack();
  }, [cancelDownload, navigation]);

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
