import React from 'react';
import { View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { EntModule } from '~/app/module';
import { HeadingSText } from '~/framework/components/text';

function CModuleHomeScreen({}: StaticScreenProps<undefined>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <HeadingSText>Là c'est les communautés</HeadingSText>
    </View>
  );
}

function CModuleDetailsScreen({}: StaticScreenProps<{
  cId: number;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <HeadingSText>Là c'est les communautés</HeadingSText>
    </View>
  );
}

function CModuleModalScreen({}: StaticScreenProps<{
  cvidiou: string;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <HeadingSText>Là c'est les communautés</HeadingSText>
    </View>
  );
}

export default new EntModule({
  entries: {
    tab: {
      iconActive: 'communities-fill',
      iconInactive: 'communities-outline',
      order: 30,
      route: 'cmodule/home',
      testId: 'tabbar-communities',
    },
  },
  modals: {
    'cmodule/modal': { screen: CModuleModalScreen },
  },
  name: 'cmodule',
  screens: {
    'cmodule/details': { screen: CModuleDetailsScreen },
    'cmodule/home': { screen: CModuleHomeScreen },
  },
});
