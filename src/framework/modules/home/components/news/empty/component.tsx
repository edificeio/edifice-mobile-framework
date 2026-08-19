import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import { Svg } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';

import { EMPTY_IMAGE_SIZE } from '../constants';
import styles from './styles';

export const NewsEmpty = React.memo(() => (
  <View style={styles.card}>
    <Svg name="empty-news-small" width={EMPTY_IMAGE_SIZE} height={EMPTY_IMAGE_SIZE} />
    <SmallText style={styles.text}>{I18n.get('home-news-empty')}</SmallText>
  </View>
));
