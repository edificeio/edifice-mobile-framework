import React from 'react';
import { View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import { PrimaryButton } from '~/framework/components/button';
import { BodyText } from '~/framework/components/text';
import { Platform } from '~/framework/util/appConf';

import { useSignInNavigation } from '../navigation';

const SignInCredentialsScreens = React.memo(function ({
  route: {
    params: { platform },
  },
}: StaticScreenProps<{ platform: Platform }>) {
  const { navigate } = useSignInNavigation();

  return (
    <View>
      <BodyText>SignInCredentialsScreens</BodyText>
      <BodyText>{platform.displayName}</BodyText>
      <BodyText>({platform.name})</BodyText>
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
SignInCredentialsScreens.displayName = 'SignInCredentialsScreens';

export default defineScreen({ options: { title: 'AAConnexion' }, screen: SignInCredentialsScreens });
