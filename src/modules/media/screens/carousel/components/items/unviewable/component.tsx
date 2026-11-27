import React from 'react';
import { View } from 'react-native';

import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { showPrivacyAlert } from '~/modules/media/privacy-alert';
import { useDownloadMedia } from '~/modules/media/screens/carousel/hooks/download-media';
import { FileMedia } from '~/modules/media/types';
import { I18n } from '~/util/i18n';

import styles from './styles';

const ICON_SIZE = 95;

const UnviewableItem = React.memo(({ media }: { media: FileMedia }) => {
  const downloadMedia = useDownloadMedia();
  const fileName = media.name?.trim() ?? '';

  const onDownload = React.useCallback(() => showPrivacyAlert(() => downloadMedia(media)), [downloadMedia, media]);

  return (
    <View style={styles.container}>
      <Svg name="ui-no-preview" width={ICON_SIZE} height={ICON_SIZE} fill={theme.palette.grey.white} />
      <View style={styles.textContainer}>
        <SmallText style={styles.text}>{fileName}</SmallText>
        <SmallBoldText style={styles.text}>{I18n.get('carousel-unviewable-file')}</SmallBoldText>
      </View>
      <PrimaryButton
        iconLeft="ui-download"
        text={I18n.get('carousel-filepreview-download')}
        action={onDownload}
        style={styles.downloadButton}
      />
    </View>
  );
});

export default UnviewableItem;
