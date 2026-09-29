import React from 'react';
import { Text, View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { CoreModule } from '~/app/module';

function DModuleHomeScreen({}: StaticScreenProps<{
  dParam: boolean;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <Text>D Home Screen</Text>
    </View>
  );
}

function DModuleDetailsScreen({}: StaticScreenProps<{
  dId: number;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <Text>D Details Screen</Text>
    </View>
  );
}

function DModuleModalScreen({}: StaticScreenProps<{
  dvidiou: string;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <Text>D Modal Screen</Text>
    </View>
  );
}

export default new CoreModule({
  modals: {
    'dmodule/modal': { screen: DModuleHomeScreen },
  },
  name: 'dmodule',
  screens: {
    'dmodule/details': { screen: DModuleDetailsScreen },
    'dmodule/home': { screen: DModuleModalScreen },
  },
});
