import React from 'react';
import { View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { defineModal } from '~/app/navigation-new';
import { BodyText } from '~/framework/components/text';

const AuthForgotScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  return (
    <View>
      <BodyText>AuthForgotScreen</BodyText>
    </View>
  );
});
AuthForgotScreen.displayName = 'AuthForgotScreen';

export default defineModal({ options: { title: 'Mdp oublié' }, screen: AuthForgotScreen });
