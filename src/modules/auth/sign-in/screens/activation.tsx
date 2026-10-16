import React from 'react';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import type { Platform } from '~/framework/util/appConf';
import type { AuthCredentials } from '~/modules/auth/model';
import SignInActivationScreenTemplate, {
  type SignInActivationScreenTemplateProps,
} from '~/modules/auth/sign-in/templates/activation';
import { useSignIn } from '~/modules/auth/sign-in/use-sign-in';
import { I18n } from '~/util/i18n';

const SignInActivationScreen = React.memo(function ({
  route: {
    params: { credentials, platform },
  },
}: StaticScreenProps<{
  platform: Platform['name'];
  credentials: AuthCredentials;
}>) {
  const navigation = useNavigation<SignInActivationScreenTemplateProps['navigation']>();
  const { activate } = useSignIn();
  return (
    <SignInActivationScreenTemplate credentials={credentials} navigation={navigation} platform={platform} trySubmit={activate} />
  );
});
SignInActivationScreen.displayName = 'SignInActivationScreen';

export default defineScreen({ options: { title: I18n.get('auth-navigation-activation-title') }, screen: SignInActivationScreen });
