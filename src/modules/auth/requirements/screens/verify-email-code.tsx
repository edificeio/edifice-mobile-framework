import React from 'react';

import type { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import { I18n } from '~/util/i18n';

import { refreshRequirements } from '../../flows';
import { emailValidation } from '../../service/validation';
import { useAccountWithRequirement } from '../../store/accounts';
import RequirementMFAScreenTemplate from '../templates/mfa';

type RequirementEmailCodeScreenProps = StaticScreenProps<{ email: string }>;

/**
 * Requirement: the user types the code sent to their email.
 * Once the code is correct, the requirement is checked again (see `refreshRequirements`) and the app shows the next step by itself.
 */
const RequirementEmailCodeScreen = React.memo(function ({ route }: RequirementEmailCodeScreenProps) {
  const { email } = route.params;
  // This screen only shows while there is a connected account with a requirement.
  const account = useAccountWithRequirement()!;
  const onVerifyCode = React.useCallback((code: string) => emailValidation.validate(account, code), [account]);
  const onResendCode = React.useCallback(async () => {
    await emailValidation.requestCode(account, email);
  }, [account, email]);
  const onVerified = React.useCallback(async () => {
    await refreshRequirements();
  }, []);
  return (
    <RequirementMFAScreenTemplate
      kind="email"
      target={email}
      onResendCode={onResendCode}
      onVerified={onVerified}
      onVerifyCode={onVerifyCode}
    />
  );
});
RequirementEmailCodeScreen.displayName = 'RequirementEmailCodeScreen';

export default defineScreen({
  options: { title: I18n.get('auth-change-email-verify') },
  screen: RequirementEmailCodeScreen,
});
