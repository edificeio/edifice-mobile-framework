import React from 'react';
import { View } from 'react-native';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import { PrimaryButton } from '~/framework/components/button';
import { BodyText } from '~/framework/components/text';

import { useSignInNavigation } from '../navigation';

const AuthWelcomeScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const { navigate: signInNavigate } = useSignInNavigation();
  const { navigate } = useNavigation();

  return (
    <View>
      <BodyText>AuthWelcomeScreen</BodyText>
      <PrimaryButton
        testID="suivant"
        text="Suivant"
        onPress={() => {
          signInNavigate('signIn/platforms');
        }}
      />
      <PrimaryButton
        testID="modal"
        text="Open modal"
        onPress={() => {
          navigate('amodule/modal', { skibidi: '' });
        }}
      />
    </View>
  );
});
AuthWelcomeScreen.displayName = 'AuthWelcomeScreen';

export default defineScreen({ options: { title: 'Bienvenue' }, screen: AuthWelcomeScreen });
