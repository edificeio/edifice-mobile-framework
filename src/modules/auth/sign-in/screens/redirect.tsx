import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import type { Platform } from '~/framework/util/appConf';
import SignInRedirectScreenTemplate from '~/modules/auth/sign-in/templates/redirect';
import { I18n } from '~/util/i18n';

const SignInRedirectScreen = React.memo(function ({
  route: {
    params: { platform },
  },
}: StaticScreenProps<{ platform: Platform['name'] }>) {
  return <SignInRedirectScreenTemplate platform={platform} />;
});
SignInRedirectScreen.displayName = 'SignInRedirectScreen';

export default defineScreen({ options: () => ({ title: I18n.get('auth-wayf-main-title') }), screen: SignInRedirectScreen });
