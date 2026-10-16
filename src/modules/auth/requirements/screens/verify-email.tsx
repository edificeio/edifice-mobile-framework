import React from 'react';

import { defineScreen } from '~/app/navigation-new';
import { I18n } from '~/util/i18n';

import { logout } from '../../flows';
import { emailValidation } from '../../service';
import { useAccountWithRequirement } from '../../store/accounts';
import { useRequirementsNavigation } from '../navigation';
import RequirementVerifyEmailScreenTemplate from '../templates/verify-email';

/**
 * Requirement: the user must verify its email.
 * A validation code is requested, then the user types it in the next screen, where the requirement is checked again.
 */
const RequirementVerifyEmailScreen = React.memo(function ({}) {
  // This screen only shows while there is a connected account with a requirement.
  const account = useAccountWithRequirement()!;
  const navigation = useRequirementsNavigation();
  const onSubmit = React.useCallback(
    async (email: string) => {
      await emailValidation.requestCode(account, email);
      navigation.navigate('requirements/verify-email-code', { email });
    },
    [account, navigation],
  );
  return <RequirementVerifyEmailScreenTemplate defaultEmail={account.user.email} onRefuse={logout} onSubmit={onSubmit} />;
});
RequirementVerifyEmailScreen.displayName = 'RequirementVerifyEmailScreen';

export default defineScreen({
  options: { animation: 'slide_from_bottom', title: I18n.get('auth-change-email-verify') },
  screen: RequirementVerifyEmailScreen,
});
