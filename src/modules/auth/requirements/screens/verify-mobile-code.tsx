import React from 'react';

import type { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import { refreshRequirements } from '~/modules/auth/flows';
import { mobileValidation } from '~/modules/auth/service/validation';
import { useAccountWithRequirement } from '~/modules/auth/store/accounts';
import MFAScreenTemplate, { getMobileMFATexts, mobileMFATestIds } from '~/modules/auth/templates/mfa';
import { I18n } from '~/util/i18n';

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
    <MFAScreenTemplate
      kind="mobile"
      onResendCode={onResendCode}
      onVerified={onVerified}
      onVerifyCode={onVerifyCode}
      testIds={mobileMFATestIds}
      texts={getMobileMFATexts(mobile)}
    />
  );
});
RequirementMobileCodeScreen.displayName = 'RequirementMobileCodeScreen';

export default defineScreen({
  options: { title: I18n.get('auth-change-mobile-verify') },
  screen: RequirementMobileCodeScreen,
});
