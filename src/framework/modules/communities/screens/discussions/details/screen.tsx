import * as React from 'react';
import { View } from 'react-native';

import { screenOptions } from '~/app/navigation/util';
import { SmallBoldText } from '~/framework/components/text';

import styles from './styles';

export const DiscussionDetailsScreenOptions = screenOptions(() => ({ headerShadowVisible: false, headerTitle: '' }));

const DiscussionDetailsScreen = () => (
  <View style={styles.container}>
    <SmallBoldText>coucou</SmallBoldText>
  </View>
);

export default DiscussionDetailsScreen;
