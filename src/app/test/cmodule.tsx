import React from 'react';
import { Text, View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { EntModule } from '~/app/module';

function CModuleHomeScreen({}: StaticScreenProps<{
  cParam: boolean;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <Text>C Home Screen</Text>
    </View>
  );
}

function CModuleDetailsScreen({}: StaticScreenProps<{
  cId: number;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <Text>C Details Screen</Text>
    </View>
  );
}

function CModuleModalScreen({}: StaticScreenProps<{
  cvidiou: string;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <Text>C Modal Screen</Text>
    </View>
  );
}

export default new EntModule({
  modals: {
    'cmodule/modal': { screen: CModuleHomeScreen },
  },
  name: 'cmodule',
  screens: {
    'cmodule/details': { screen: CModuleDetailsScreen },
    'cmodule/home': { screen: CModuleModalScreen },
  },
  tab: { iconActive: 'ui-sparkle', iconInactive: 'ui-answer', order: 1, route: 'cmodule/home', testId: 'c' },
});
