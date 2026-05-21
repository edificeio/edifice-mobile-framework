import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { I18n } from '~/app/i18n';
import { modalScreenOptions } from '~/app/navigation/util';
import theme from '~/app/theme';
import { useCarouselFileHandler } from '~/framework/components/carousel-multimedia/hooks';
import { BodyBoldText, SmallBoldText } from '~/framework/components/text';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';

import styles from './styles';

export interface DownloadModalProps extends NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.Download> {}

export const DownloadModalScreenOptions = modalScreenOptions('transparentModal', () => ({ headerShown: false }));

const DownloadModal = (props: DownloadModalProps) => {
  const { navigation, route } = props;
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

export default DownloadModal;
