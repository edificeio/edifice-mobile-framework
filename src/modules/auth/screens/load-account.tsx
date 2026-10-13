import React from 'react';
import { View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import { useSignInStore } from '~/app/navigation-new/store';
import { PrimaryButton } from '~/framework/components/button';
import { BodyText } from '~/framework/components/text';

const AuthLoadAccountScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const signIn = useSignInStore(s => s.signIn);
  return (
    <View>
      <BodyText>AuthLoadAccountScreen</BodyText>
      <PrimaryButton
        testID="login"
        text="Se connecter"
        onPress={() => {
          signIn({ id: 'aaaa' });
        }}
      />
    </View>
  );
});
AuthLoadAccountScreen.displayName = 'AuthLoadAccountScreen';
export default defineScreen({
  options: { title: 'Connexion' },
  screen: AuthLoadAccountScreen,
});
