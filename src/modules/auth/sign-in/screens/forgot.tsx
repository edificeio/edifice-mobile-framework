import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';

import { defineModal } from '~/app/navigation-new';
import type { Platform } from '~/framework/util/appConf';
import { ForgotMode } from '~/modules/auth/model';
import service from '~/modules/auth/service';
import SignInForgotScreenTemplate, { SignInForgotScreenTemplateProps } from '~/modules/auth/sign-in/templates/forgot';
import { I18n } from '~/util/i18n';

const SignInForgotScreen = React.memo(function ({
  route: {
    params: { login, mode, platform },
  },
}: StaticScreenProps<{ platform: Platform['name']; mode: ForgotMode; login?: string }>) {
  const handleSubmit = React.useCallback<SignInForgotScreenTemplateProps['handleSubmit']>(
    ({ firstName, login: submittedLogin, structureId }) =>
      mode === 'id'
        ? service.forgot(platform, mode, { firstName, mail: submittedLogin, structureId })
        : service.forgot(platform, mode, { login: submittedLogin }),
    [mode, platform],
  );
  return <SignInForgotScreenTemplate handleSubmit={handleSubmit} login={login} mode={mode} platform={platform} />;
});
SignInForgotScreen.displayName = 'SignInForgotScreen';

export default defineModal({
  options: ({ route }) => ({
    title: route.params.mode === 'id' ? I18n.get('auth-navigation-forgot-id') : I18n.get('auth-navigation-forgot-password'),
  }),
  screen: SignInForgotScreen,
});
