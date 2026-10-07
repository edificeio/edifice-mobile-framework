import React from 'react';
import { ScrollView, View } from 'react-native';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';

import { EntModule } from '~/app/module';
import { defineModal, defineScreen, sharedTransitions, StackNavigation } from '~/app/navigation-new';
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
          navigation.navigate('amodule/modal', { skibidi: 'Nom de la modale très très long avec du texte' });
        }}
      />
      <Animated.Image
        source={{ uri: 'https://picsum.photos/id/39/200' }}
        style={{ height: 100, width: 300 }}
        sharedTransitionTag="sharedTag"
        sharedTransitionStyle={sharedTransitions.default}
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

const AModuleHomeScreenDeclaration = defineScreen({
  screen: AModuleHomeScreen,
});

function AModuleDetailsScreen({}: StaticScreenProps<{
  aId: number;
}>) {
  const navigation = useNavigation<StackNavigation>();
  return (
    <View style={{ alignItems: 'center', borderWidth: 4, flex: 1, justifyContent: 'center' }}>
      <Animated.Image
        source={{ uri: 'https://picsum.photos/id/39/200' }}
        style={{ height: 300, width: 300 }}
        sharedTransitionTag="sharedTag"
        sharedTransitionStyle={sharedTransitions.default}
      />
      <BodyText>A Details Screen</BodyText>
      <PrimaryButton
        testID="1"
        text="Push a new details"
        onPress={() => {
          navigation.push('amodule/details', { aId: 4 });
        }}
      />
    </View>
  );
}

const AModuleDetailsScreenDeclaration = defineScreen({
  options: ({
    route: {
      params: { aId },
    },
  }) => ({ title: aId.toString() + 'Un nom particulièrement long pour rentrer dans un header title' }),
  screen: AModuleDetailsScreen,
});

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

const AModuleModalScreenDeclaration = defineModal({
  options: ({
    route: {
      params: { skibidi },
    },
  }) => ({ title: skibidi }),
  screen: AModuleModalScreen,
});

export default new EntModule({
  modals: {
    'amodule/modal': AModuleModalScreenDeclaration,
  },
  name: 'amodule',
  screens: {
    'amodule/details': AModuleDetailsScreenDeclaration,
    'amodule/home': AModuleHomeScreenDeclaration,
  },
  tab: { iconActive: 'ui-camera', iconInactive: 'ui-anniversary', order: 1, route: 'amodule/home', testId: 'a' },
});
