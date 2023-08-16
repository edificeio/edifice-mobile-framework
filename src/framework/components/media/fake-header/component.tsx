import { Header, HeaderBackButton } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import * as React from 'react';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default function FakeHeaderMedia() {
  const navigation = useNavigation();
  return (
    <Header
      title=""
      headerShadowVisible
      headerTransparent
      // eslint-disable-next-line react/no-unstable-nested-components
      headerLeft={() => (
        <HeaderBackButton
          onPress={() => navigation.goBack()}
          tintColor={theme.palette.grey.white}
          style={{ marginLeft: UI_SIZES.spacing.minor }}
        />
      )}
      headerTintColor="white"
    />
  );
}
