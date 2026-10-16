import React from 'react';

import type { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import { I18n } from '~/util/i18n';

import { refreshRequirements } from '../../flows';
import { mobileValidation } from '../../service/validation';
import { useAccountWithRequirement } from '../../store/accounts';
import RequirementMFAScreenTemplate from '../templates/mfa';

type RequirementMobileCodeScreenProps = StaticScreenProps<{ mobile: string }>;

/**
 * Requirement: the user types the code sent to their mobile.
 * Once the code is correct, the requirement is checked again (see `refreshRequirements`) and the app shows the next step by itself.
 */
const RequirementMobileCodeScreen = React.memo(function ({ route }: RequirementMobileCodeScreenProps) {
  const { mobile } = route.params;
  // This screen only shows while there is a connected account with a requirement.
  const account = useAccountWithRequirement()!;
  const onVerifyCode = React.useCallback((code: string) => mobileValidation.validate(account, code), [account]);
  const onResendCode = React.useCallback(async () => {
    await mobileValidation.requestCode(account, mobile);
  }, [account, mobile]);
  const onVerified = React.useCallback(async () => {
    await refreshRequirements();
  }, []);
  return (
    <RequirementMFAScreenTemplate
      kind="mobile"
      target={mobile}
      onResendCode={onResendCode}
      onVerified={onVerified}
      onVerifyCode={onVerifyCode}
    />
  );
});
RequirementMobileCodeScreen.displayName = 'RequirementMobileCodeScreen';

export default defineScreen({
  options: { title: I18n.get('auth-change-mobile-verify') },
  screen: RequirementMobileCodeScreen,
});
