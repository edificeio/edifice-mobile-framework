import React from 'react';
import { View } from 'react-native';

import styles from './styles';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText } from '~/framework/components/text';

const ICON_SIZE = 95;

const UnknownItem = () => {
  return (
    <View style={styles.container}>
      <Svg name="image-not-found" width={ICON_SIZE} height={ICON_SIZE} fill={theme.palette.grey.white} />
      <View style={styles.textContainer}>
        <SmallBoldText style={styles.text}>{I18n.get('carousel-unknown-file')}</SmallBoldText>
      </View>
    </View>
  );
};

export default UnknownItem;
