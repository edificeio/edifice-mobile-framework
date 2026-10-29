import * as React from 'react';

import { Header, HeaderBackButton } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default function FakeHeaderMedia() {
  const navigation = useNavigation();
  return (
    <Header
      title=""
      headerShadowVisible
      headerTransparent
      headerLeft={() => (
        <HeaderBackButton
          labelVisible={false}
          style={{ marginLeft: UI_SIZES.spacing.minor }}
          tintColor={theme.palette.grey.white.toString()}
          onPress={() => navigation.goBack()}
        />
      )}
      headerTintColor="white"
    />
  );
}
