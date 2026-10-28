import React from 'react';
import { View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { EntModule } from '~/app/module';
import { HeadingSText } from '~/framework/components/text';

function EModuleHomeScreen({}: StaticScreenProps<{
  eParam: boolean;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <HeadingSText>Là c'est les applis</HeadingSText>
    </View>
  );
}

function EModuleDetailsScreen({}: StaticScreenProps<{
  eId: number;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <HeadingSText>Là c'est les applis</HeadingSText>
    </View>
  );
}

function EModuleModalScreen({}: StaticScreenProps<{
  evidiou: string;
}>) {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <HeadingSText>Là c'est les applis</HeadingSText>
    </View>
  );
}

export default new EntModule({
  modals: {
    'emodule/modal': { screen: EModuleHomeScreen },
  },
  name: 'emodule',
  screens: {
    'emodule/details': { screen: EModuleDetailsScreen },
    'emodule/home': { screen: EModuleModalScreen },
  },
  tab: {
    iconActive: 'ui-applications-fill',
    iconInactive: 'ui-applications',
    order: 40,
    route: 'emodule/home',
    testId: 'tabbar-myapps',
  },
});
