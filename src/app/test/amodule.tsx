import React from 'react';
import { Text, View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { EntModule } from '~/app/module';

function AModuleHomeScreen({}: StaticScreenProps<{
  aParam: boolean;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <Text>A Home Screen</Text>
    </View>
  );
}

function AModuleDetailsScreen({}: StaticScreenProps<{
  aId: number;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <Text>A Details Screen</Text>
    </View>
  );
}

function AModuleModalScreen({}: StaticScreenProps<{
  skibidi: string;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <Text>A Modal Screen</Text>
    </View>
  );
}

export default new EntModule({
  modals: {
    'amodule/modal': { screen: AModuleModalScreen },
  },
  name: 'amodule',
  screens: {
    'amodule/details': { screen: AModuleDetailsScreen },
    'amodule/home': { screen: AModuleHomeScreen },
  },
  tab: { iconActive: 'ui-camera', iconInactive: 'ui-anniversary', order: 1, route: 'amodule/home', testId: 'a' },
});
