import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import { CaptionText } from '~/framework/components/text';

import styles from './styles';

const UnreadMessagesSeparator = () => (
  <View style={styles.root}>
    <View style={styles.line} />
    <CaptionText style={styles.text}>{I18n.get('communities-discussion-last-visit')}</CaptionText>
    <View style={styles.line} />
  </View>
);

export default React.memo(UnreadMessagesSeparator);
