import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import { Platform } from '~/framework/util/appConf';

import { signIn } from '../../service';
import { useSignInNavigation } from '../navigation';
import SignInCredentialsScreenTemplate, { SignInCredentialsScreenTemplateProps } from '../templates/credentials';

const SignInCredentialsScreens = React.memo(function ({
  route: {
    params: { platform },
  },
}: StaticScreenProps<{ platform: Platform['name'] }>) {
  // const { navigate } = useSignInNavigation();
  const handleSignIn = React.useCallback<NonNullable<SignInCredentialsScreenTemplateProps['handleSignIn']>>(
    async (credentials, screenKey, account) => {
      try {
        await signIn.withCredentials(platform, credentials, screenKey, account);
      } catch (e) {
        console.error(e);
      }
    },
    [platform],
  );
  return <SignInCredentialsScreenTemplate handleSignIn={handleSignIn} platform={platform} />;
});
SignInCredentialsScreens.displayName = 'SignInCredentialsScreens';

export default defineScreen({ options: { title: 'AAConnexion' }, screen: SignInCredentialsScreens });
