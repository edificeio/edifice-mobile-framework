import React from 'react';
import { View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { EntModule } from '~/app/module';
import { HeadingSText } from '~/framework/components/text';
import { AccountsButton } from '~/modules/auth/components';

function BModuleHomeScreen({}: StaticScreenProps<{
  bParam: boolean;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <HeadingSText>Là c'est les mails</HeadingSText>
      <AccountsButton />
    </View>
  );
}

function BModuleDetailsScreen({}: StaticScreenProps<{
  bId: number;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <HeadingSText>Là c'est les mails</HeadingSText>
      <AccountsButton />
    </View>
  );
}

function BModuleModalScreen({}: StaticScreenProps<{
  bididou: string;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <HeadingSText>Là c'est les mails</HeadingSText>
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
  tab: { iconActive: 'ui-mails-fill', iconInactive: 'ui-mails', order: 20, route: 'bmodule/home', testId: 'tabbar-mails' },
});
