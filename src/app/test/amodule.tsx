import React from 'react';
import { ScrollView, View } from 'react-native';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';

import { EntModule } from '~/app/module';
import { defineScreen } from '~/app/navigation-new';
import { PrimaryButton } from '~/framework/components/button';
import { BodyText } from '~/framework/components/text';

function AModuleHomeScreen({}: StaticScreenProps<{
  aParam: boolean;
}>) {
  const navigation = useNavigation();
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <BodyText>A Home Screen</BodyText>
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
      <BodyText>A Details Screen</BodyText>
    </View>
  );
}
AModuleDetailsScreen.options = {} as const;

function AModuleModalScreen({}: StaticScreenProps<{
  skibidi: string;
}>) {
  return (
    <ScrollView>
      <BodyText>A Modal Screen</BodyText>
      {new Array(20).fill(true).map((_, index) => (
        <BodyText key={index}>{index}</BodyText>
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
