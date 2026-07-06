import * as React from 'react';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import AuthLoginRedirectScreenTemplate, { AuthLoginRedirectScreenProps } from '~/framework/modules/auth/templates/login-redirect';

export default function AuthLoginRedirectScreen(props: AuthLoginRedirectScreenProps) {
  return <AuthLoginRedirectScreenTemplate {...props} />;
}
AuthLoginRedirectScreen.options = screenOptions(() => ({ title: I18n.get('auth-wayf-main-title') }));
