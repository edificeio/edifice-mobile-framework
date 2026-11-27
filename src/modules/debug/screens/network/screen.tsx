import * as React from 'react';
import { View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';
import NetworkLogger from 'react-native-network-logger';

import { defineModal } from '~/app/navigation-new';

import styles from './styles';

export function NetworkScreen({}: StaticScreenProps<undefined>) {
  return (
    <View style={styles.page}>
      <NetworkLogger maxRows={20} theme="light" />
    </View>
  );
}

export default defineModal({
  options: () => ({ presentation: 'fullScreenModal', title: 'Network Log' }),
  screen: NetworkScreen,
});
