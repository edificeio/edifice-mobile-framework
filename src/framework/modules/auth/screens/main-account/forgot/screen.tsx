import * as React from 'react';

import type { AuthForgotScreenProps } from './types';

import ForgotPage from '~/framework/modules/auth/templates/forgot';

export default function AuthForgotScreen(props: AuthForgotScreenProps) {
  return <ForgotPage {...props} />;
}
