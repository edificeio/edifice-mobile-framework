import React from 'react';
import { View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import { BodyText } from '~/framework/components/text';

const AuthPlatformsScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  return (
    <View>
      <BodyText>AuthPlatformsScreen</BodyText>
    </View>
  );
});
AuthPlatformsScreen.displayName = 'AuthPlatformsScreen';

export default defineScreen({ options: { title: 'Sélectionner une PF' }, screen: AuthPlatformsScreen });
