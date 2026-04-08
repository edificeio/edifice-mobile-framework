import React from 'react';
import { View } from 'react-native';

import styles from './styles';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import { useCarouselFileHandler } from '~/framework/components/carousel-multimedia/hooks';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { FileMedia } from '~/framework/util/media';

const ICON_SIZE = 95;

const UnviewableItem = ({ file }: { file: FileMedia }) => {
  const { onSave } = useCarouselFileHandler(file);
  const fileName = file.name?.trim() ?? '';

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
        action={onSave}
        style={styles.downloadButton}
      />
    </View>
  );
};

export default UnviewableItem;
