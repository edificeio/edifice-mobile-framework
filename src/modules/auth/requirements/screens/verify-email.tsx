import React from 'react';

import { defineScreen } from '~/app/navigation-new';
import { logout } from '~/modules/auth/flows';
import { useRequirementsNavigation } from '~/modules/auth/requirements/navigation';
import { emailValidation } from '~/modules/auth/service';
import { useAccountWithRequirement } from '~/modules/auth/store/accounts';
import VerifyEmailScreenTemplate, { getVerifyEmailTexts } from '~/modules/auth/templates/verify-email';
import { I18n } from '~/util/i18n';

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
  return (
    <VerifyEmailScreenTemplate
      confirmLeaveWhenEdited
      defaultEmail={account.user.email}
      onRefuse={logout}
      onSubmit={onSubmit}
      texts={getVerifyEmailTexts()}
    />
  );
});
RequirementVerifyEmailScreen.displayName = 'RequirementVerifyEmailScreen';

export default defineScreen({
  options: { animation: 'slide_from_bottom', title: I18n.get('auth-change-email-verify') },
  screen: RequirementVerifyEmailScreen,
});
