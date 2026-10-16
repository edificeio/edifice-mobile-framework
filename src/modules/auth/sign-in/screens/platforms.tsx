import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { defineScreen } from '~/app/navigation-new';
import { getRouteForPlatformSelect, useSignInNavigation } from '~/modules/auth/sign-in/navigation';
import AuthPlatformsScreenTemplate from '~/modules/auth/sign-in/templates/platforms';
import { I18n } from '~/util/i18n';

const AuthPlatformsScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const { navigate } = useSignInNavigation();
  const { top: paddingTop } = useSafeAreaInsets();
  return (
    <AuthPlatformsScreenTemplate
      onOpenItem={platform => {
        navigate(getRouteForPlatformSelect(platform.name));
      }}
      contentContainerStyle={React.useMemo(() => ({ paddingTop }), [paddingTop])}
    />
  );
});
AuthPlatformsScreen.displayName = 'AuthPlatformsScreen';

export default defineScreen({
  options: {
    headerTitle: () => '', // Hide header title but still have it defined (for back menu)
    headerTransparent: true,
    title: I18n.get('auth-platformselect-welcome'),
  },
  screen: AuthPlatformsScreen,
});
