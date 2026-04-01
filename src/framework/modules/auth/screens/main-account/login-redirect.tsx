import * as React from 'react';

import type { NativeStackNavigatorProps } from '@react-navigation/native-stack';

import { I18n } from '~/app/i18n';
import AuthLoginRedirectScreenTemplate, { AuthLoginRedirectScreenProps } from '~/framework/modules/auth/templates/login-redirect';

export default function AuthLoginRedirectScreen(props: AuthLoginRedirectScreenProps) {
  return <AuthLoginRedirectScreenTemplate {...props} />;
}
AuthLoginRedirectScreen.options = { title: I18n.get('auth-wayf-main-title') } satisfies NativeStackNavigatorProps['screenOptions'];
