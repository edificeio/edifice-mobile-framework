import React from 'react';
import { Text, View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { EntModule } from '~/app/module';
import { AccountsButton } from '~/modules/auth/components';

function BModuleHomeScreen({}: StaticScreenProps<{
  bParam: boolean;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <Text>B Home Screen</Text>
      <AccountsButton />
    </View>
  );
}

function BModuleDetailsScreen({}: StaticScreenProps<{
  bId: number;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <Text>B Details Screen</Text>
      <AccountsButton />
    </View>
  );
}

function BModuleModalScreen({}: StaticScreenProps<{
  bididou: string;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <Text>B Modal Screen</Text>
    </View>
  );
}

export default new EntModule({
  modals: {
    'bmodule/modal': { screen: BModuleModalScreen },
  },
  name: 'bmodule',
  screens: {
    'bmodule/details': { screen: BModuleDetailsScreen },
    'bmodule/home': { screen: BModuleHomeScreen },
  },
  tab: { iconActive: 'ui-eyeSlash', iconInactive: 'ui-eye', order: 1, route: 'bmodule/home', testId: 'b' },
});
