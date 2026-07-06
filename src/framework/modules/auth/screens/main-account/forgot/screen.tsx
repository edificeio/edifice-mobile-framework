import * as React from 'react';

import { I18n } from '~/app/i18n';
import { modalScreenOptions } from '~/app/navigation/util';
import ForgotPage from '~/framework/modules/auth/templates/forgot';

import type { AuthForgotScreenProps } from './types';

export default function AuthForgotScreen(props: AuthForgotScreenProps) {
  return <ForgotPage {...props} />;
}

export const AuthForgotScreenOptions = modalScreenOptions<'auth/forgot'>('fullScreenModal', ({ route }) => ({
  title: route.params.mode === 'id' ? I18n.get('auth-navigation-forgot-id') : I18n.get('auth-navigation-forgot-password'),
}));
