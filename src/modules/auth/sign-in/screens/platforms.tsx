import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { defineScreen, useIsModal } from '~/app/navigation-new';
import { getRouteForPlatformSelect, useSignInNavigation } from '~/modules/auth/sign-in/navigation';
import AuthPlatformsScreenTemplate from '~/modules/auth/sign-in/templates/platforms';
import { I18n } from '~/util/i18n';

/**
 * `showWelcome` is decided by the flow that shows the screen (load account: welcome branding, add account: none).
 * Insets only depend on how the screen is presented (modal or card).
 */
const PlatformsScreenContent = ({ showWelcome }: { showWelcome: boolean }) => {
  const { navigate } = useSignInNavigation();
  const isModal = useIsModal();
  const insets = useSafeAreaInsets();
  return (
    <AuthPlatformsScreenTemplate
      showWelcome={showWelcome}
      onOpenItem={platform => {
        navigate(getRouteForPlatformSelect(platform.name));
      }}
      contentContainerStyle={React.useMemo(() => ({ paddingTop: !isModal ? insets.top : undefined }), [isModal, insets.top])}
    />
  );
};

const AuthPlatformsScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  return <PlatformsScreenContent showWelcome />;
});
AuthPlatformsScreen.displayName = 'AuthPlatformsScreen';

const AddAccountPlatformsScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  return <PlatformsScreenContent showWelcome={false} />;
});
AddAccountPlatformsScreen.displayName = 'AddAccountPlatformsScreen';

export default defineScreen({
  options: () => ({
    headerTitle: () => '', // Hide header title but still have it defined (for back menu)
    headerTransparent: true,
    title: I18n.get('auth-platformselect-welcome'),
  }),
  screen: AuthPlatformsScreen,
});

/**
 * The same screen for the add-account modal: the header is visible, with the title of the modal.
 */
export const AddAccountAuthPlatformsScreen = defineScreen({
  options: () => ({
    title: I18n.get('auth-add-account-modal-title'),
  }),
  screen: AddAccountPlatformsScreen,
});
