import * as React from 'react';
import { View } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import styles from './styles';

import { ButtonLineGroup, LineButton } from '~/framework/components/buttons/line';
import { HeadingSText } from '~/framework/components/text';
import { ModalsRouteNames } from '~/framework/navigation/modals';
import appConf from '~/framework/util/appConf';

export function DebugOptions() {
  const navigation = useNavigation();
  if (appConf.isDebugEnabled && navigation) {
    return (
      <View style={styles.section}>
        <HeadingSText style={styles.sectionTitle}>Debug</HeadingSText>
        <ButtonLineGroup>
          <LineButton
            title="App Infos"
            icon="ui-infoCircle"
            onPress={() => {
              navigation.navigate(ModalsRouteNames.Infos, {});
            }}
          />
          <LineButton
            title="App Log"
            icon="ui-text-page"
            onPress={() => {
              navigation.navigate(ModalsRouteNames.Log, {});
            }}
          />
          <LineButton
            title="Network Log"
            icon="ui-internet"
            onPress={() => {
              navigation.navigate(ModalsRouteNames.Network, {});
            }}
          />
        </ButtonLineGroup>
      </View>
    );
  }
  return null;
}
