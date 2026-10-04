import React from 'react';
import { Text, View } from 'react-native';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';

import { CoreModule } from '~/app/module';

function AModuleHomeScreen({
  route,
}: StaticScreenProps<{
  aParam: boolean;
}>) {
  const navigation = useNavigation();
  const oih = () => {
    navigation.navigate('amodule/modal', { skibidi: 'ldjf' });
  };

  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <Text>Home Screen</Text>
    </View>
  );
}

function AModuleModalScreen({
  route,
}: StaticScreenProps<{
  skibidi: string;
}>) {
  const navigation = useNavigation();

  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <Text>Modal Screen</Text>
    </View>
  );
}

export default new CoreModule({
  modals: {
    'amodule/modal': { screen: AModuleModalScreen },
  },
  name: 'amodule',
  screens: {
    'amodule/home': { screen: AModuleHomeScreen },
  },
});
