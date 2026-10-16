import React from 'react';

import type { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import { refreshRequirements } from '~/modules/auth/flows';
import service from '~/modules/auth/service';
import { useAccountWithRequirement } from '~/modules/auth/store/accounts';
import MFAScreenTemplate, { emailMFATestIds, getEmailMFATexts } from '~/modules/auth/templates/mfa';
import { I18n } from '~/util/i18n';

/**
 * Requirement: the user types the code sent to their email.
 * Once the code is correct, the requirement is checked again (see `refreshRequirements`) and the app shows the next step by itself.
 */
const RequirementEmailCodeScreen = React.memo(function ({ route }: StaticScreenProps<{ email: string }>) {
  const { email } = route.params;
  // This screen only shows while there is a connected account with a requirement.
  const account = useAccountWithRequirement()!;
  const onVerifyCode = React.useCallback((code: string) => service.emailValidation.validate(account, code), [account]);
  const onResendCode = React.useCallback(async () => {
    await service.emailValidation.requestCode(account, email);
  }, [account, email]);
  const onVerified = React.useCallback(async () => {
    await refreshRequirements();
  }, []);
  return (
    <MFAScreenTemplate
      kind="email"
      onResendCode={onResendCode}
      onVerified={onVerified}
      onVerifyCode={onVerifyCode}
      testIds={emailMFATestIds}
      texts={getEmailMFATexts(email)}
    />
  );
});
RequirementEmailCodeScreen.displayName = 'RequirementEmailCodeScreen';

export default defineScreen({
  options: { title: I18n.get('auth-change-email-verify') },
  screen: RequirementEmailCodeScreen,
});
