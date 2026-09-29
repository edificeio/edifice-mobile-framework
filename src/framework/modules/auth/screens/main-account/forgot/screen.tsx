import * as React from 'react';

import { modalScreenOptions } from '~/app/navigation/util';
import ForgotPage from '~/framework/modules/auth/templates/forgot';
import { I18n } from '~/util/i18n';

import type { AuthForgotScreenProps } from './types';

export default function AuthForgotScreen(props: AuthForgotScreenProps) {
  return <ForgotPage {...props} />;
}

export const AuthForgotScreenOptions = modalScreenOptions<'auth/forgot'>('fullScreenModal', ({ route }) => ({
  title: route.params.mode === 'id' ? I18n.get('auth-navigation-forgot-id') : I18n.get('auth-navigation-forgot-password'),
}));
