import * as React from 'react';

import type { AuthForgotAddAccountScreenProps } from './types';

import ForgotPage from '~/framework/modules/auth/templates/forgot';

export default function AuthForgotAddAccountScreen(props: AuthForgotAddAccountScreenProps) {
  return <ForgotPage {...props} />;
}
