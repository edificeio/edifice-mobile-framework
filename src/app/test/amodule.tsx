import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { defineScreen, EntModule } from '~/app/module';
import { PrimaryButton } from '~/framework/components/button';
import { UI_SIZES } from '~/framework/components/constants';

function AModuleHomeScreen({}: StaticScreenProps<{
  aParam: boolean;
}>) {
  const navigation = useNavigation();
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <Text>A Home Screen</Text>
      <PrimaryButton
        testID="1"
        text="Go to a modal"
        onPress={() => {
          navigation.navigate('amodule/modal', { skibidi: 'Nom de la modale' });
        }}
      />
      <PrimaryButton
        testID="1"
        text="Go to a details"
        onPress={() => {
          navigation.navigate('amodule/details', { aId: 2 });
        }}
      />
    </View>
  );
}

function AModuleDetailsScreen({}: StaticScreenProps<{
  aId: number;
}>) {
  return (
    <View style={{ alignItems: 'center', borderWidth: 4, flex: 1, justifyContent: 'center' }}>
      <Text>A Details Screen</Text>
    </View>
  );
}
AModuleDetailsScreen.options = {} as const;

function AModuleModalScreen({}: StaticScreenProps<{
  skibidi: string;
}>) {
  return (
    <ScrollView>
      <Text>A Modal Screen</Text>
      {new Array(20).fill(true).map((_, index) => (
        <Text key={index}>{index}</Text>
      ))}
    </ScrollView>
  );
}

const AModuleModalScreenDeclaration = defineScreen({
  options: ({
    route: {
      params: { skibidi },
    },
  }) => ({ animation: 'fade_from_bottom', presentation: 'modal', title: skibidi }),
  screen: AModuleModalScreen,
});

export default new EntModule({
  modals: {
    'amodule/modal': AModuleModalScreenDeclaration,
  },
  name: 'amodule',
  screens: {
    'amodule/details': { options: AModuleDetailsScreen.options, screen: AModuleDetailsScreen },
    'amodule/home': { screen: AModuleHomeScreen },
  },
  tab: { iconActive: 'ui-camera', iconInactive: 'ui-anniversary', order: 1, route: 'amodule/home', testId: 'a' },
});
