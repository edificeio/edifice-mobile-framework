import * as React from 'react';
import { View } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { ButtonLineGroup, LineButton } from '~/framework/components/buttons/line';
import { HeadingSText } from '~/framework/components/text';
import appConf from '~/framework/util/appConf';

import styles from './styles';

export function DebugOptions() {
  const navigation = useNavigation();
  const openInfos = React.useCallback(() => navigation.navigate('debug/infos'), [navigation]);
  const openLog = React.useCallback(() => navigation.navigate('debug/log'), [navigation]);
  const openNetwork = React.useCallback(() => navigation.navigate('debug/network'), [navigation]);
  if (appConf.isDebugEnabled) {
    return (
      <View style={styles.section}>
        <HeadingSText style={styles.sectionTitle}>Debug</HeadingSText>
        <ButtonLineGroup>
          <LineButton title="App Infos" icon="ui-infoCircle" onPress={openInfos} testID="debug-infos" />
          <LineButton title="App Log" icon="ui-text-page" onPress={openLog} testID="debug-log" />
          <LineButton title="Network Log" icon="ui-internet" onPress={openNetwork} testID="debug-network" />
        </ButtonLineGroup>
      </View>
    );
  }
  return null;
}
