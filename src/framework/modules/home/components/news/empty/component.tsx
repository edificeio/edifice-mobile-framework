import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import { Svg } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';

import { IMAGE_HEIGHT } from '../constants';
import styles from './styles';

export const NewsEmpty = React.memo(() => (
  <View style={styles.card}>
    <Svg name="empty-news-small" width={IMAGE_HEIGHT} height={IMAGE_HEIGHT} />
    <SmallText style={styles.text}>{I18n.get('home-news-empty')}</SmallText>
  </View>
));
