import * as React from 'react';

import ForgotPage from '~/framework/modules/auth/templates/forgot';

import type { AuthForgotScreenProps } from './types';

export default function AuthForgotScreen(props: AuthForgotScreenProps) {
  return <ForgotPage {...props} />;
}
