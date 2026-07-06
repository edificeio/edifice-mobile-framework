import * as React from 'react';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import AuthLoginRedirectScreenTemplate from '~/framework/modules/auth/templates/login-redirect';

import type { AuthLoginRedirectAddAccountScreenPrivateProps } from './types';

export const computeNavBar = screenOptions(() => ({ title: I18n.get('auth-wayf-main-title') }));

function AuthLoginRedirectAddAccountScreen(props: AuthLoginRedirectAddAccountScreenPrivateProps) {
  return <AuthLoginRedirectScreenTemplate {...props} />;
}

export default AuthLoginRedirectAddAccountScreen;
