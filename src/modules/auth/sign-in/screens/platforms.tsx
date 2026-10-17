import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { defineScreen, useIsModal } from '~/app/navigation-new';
import { modalCloseButtonOptions } from '~/app/navigation-new/options';
import { getRouteForPlatformSelect, useSignInNavigation } from '~/modules/auth/sign-in/navigation';
import AuthPlatformsScreenTemplate from '~/modules/auth/sign-in/templates/platforms';
import { I18n } from '~/util/i18n';

const AuthPlatformsScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const navigation = useSignInNavigation();
  const { navigate } = navigation;
  const isModal = useIsModal();

  // In the add-account modal this screen is the first of the navigator: it has no back button, but must close the modal.
  React.useLayoutEffect(() => {
    if (isModal)
      navigation.setOptions({
        ...modalCloseButtonOptions({ navigation: navigation as never }, { always: true }),
        headerTitle: undefined,
        headerTransparent: false,
        title: I18n.get('auth-add-account-modal-title'),
      });
  }, [isModal, navigation]);

  const insets = useSafeAreaInsets();
  return (
    <AuthPlatformsScreenTemplate
      showWelcome={!isModal}
      onOpenItem={platform => {
        navigate(getRouteForPlatformSelect(platform.name));
      }}
      contentContainerStyle={React.useMemo(() => ({ paddingTop: !isModal ? insets.top : undefined }), [isModal, insets.top])}
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
