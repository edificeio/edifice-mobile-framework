import React from 'react';
import { View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import { PrimaryButton } from '~/framework/components/button';
import { BodyText } from '~/framework/components/text';

import { useSignInNavigation } from '../navigation';

const AuthWelcomeScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const { navigate } = useSignInNavigation();

  return (
    <View>
      <BodyText>AuthWelcomeScreen</BodyText>
      <PrimaryButton
        testID="suivant"
        text="Suivant"
        onPress={() => {
          navigate('signIn/platforms');
        }}
      />
    </View>
  );
});
AuthWelcomeScreen.displayName = 'AuthWelcomeScreen';

export default defineScreen({ options: { title: 'Bienvenue' }, screen: AuthWelcomeScreen });
