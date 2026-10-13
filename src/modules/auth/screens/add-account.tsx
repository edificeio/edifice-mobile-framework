import React from 'react';
import { View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { defineModal } from '~/app/navigation-new';
import { BodyText } from '~/framework/components/text';

const AuthAddAccountScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  return (
    <View>
      <BodyText>AuthAddAccountScreen</BodyText>
    </View>
  );
});
AuthAddAccountScreen.displayName = 'AuthAddAccountScreen';
export default defineModal({
  options: { title: 'Ajouter un compte' },
  screen: AuthAddAccountScreen,
});
