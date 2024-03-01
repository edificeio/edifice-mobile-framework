import * as React from 'react';

import ForgotPage from '~/framework/modules/auth/templates/forgot';

import type { AuthForgotAddAccountScreenProps } from './types';

export default function AuthForgotAddAccountScreen(props: AuthForgotAddAccountScreenProps) {
  return <ForgotPage {...props} />;
}
