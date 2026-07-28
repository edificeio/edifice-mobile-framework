import React from 'react';
import { View } from 'react-native';

import { NavigationProp, useNavigation } from '@react-navigation/native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import { showPrivacyAlert } from '~/framework/components/carousel-multimedia/util';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { FileMedia } from '~/framework/modules/media';
import { IModalsNavigationParams } from '~/framework/navigation/modals';

import styles from './styles';

const ICON_SIZE = 95;

const UnviewableItem = React.memo(({ media }: { media: FileMedia }) => {
  const navigation = useNavigation<NavigationProp<IModalsNavigationParams>>();
  const fileName = media.name?.trim() ?? '';

  const onDownload = React.useCallback(
    () => showPrivacyAlert(() => navigation.navigate('media/download', { media })),
    [media, navigation],
  );

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
