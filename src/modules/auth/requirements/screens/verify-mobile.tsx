import React from 'react';

import { defineScreen } from '~/app/navigation-new';
import { logout } from '~/modules/auth/flows';
import { useRequirementsNavigation } from '~/modules/auth/requirements/navigation';
import service from '~/modules/auth/service';
import { useAccountWithRequirement } from '~/modules/auth/store/accounts';
import VerifyMobileScreenTemplate, { getVerifyMobileTexts } from '~/modules/auth/templates/verify-mobile';
import { I18n } from '~/util/i18n';

/**
 * Requirement: the user must verify its mobile number.
 * A validation code is sent by SMS, then the user types it in the next screen (which refreshes the requirement).
 */
const RequirementVerifyMobileScreen = React.memo(function ({}) {
  // This screen only shows while there is a connected account with a requirement.
  const account = useAccountWithRequirement()!;
  const navigation = useRequirementsNavigation();
  const onSubmit = React.useCallback(
    async (mobile: string) => {
      await service.mobileValidation.requestCode(account, mobile);
      navigation.navigate('requirements/verify-mobile-code', { mobile });
    },
    [account, navigation],
  );
  return (
    <VerifyMobileScreenTemplate
      defaultMobile={account.user.mobile}
      onRefuse={logout}
      onSubmit={onSubmit}
      texts={getVerifyMobileTexts()}
    />
  );
});
RequirementVerifyMobileScreen.displayName = 'RequirementVerifyMobileScreen';

export default defineScreen({
  options: { animation: 'slide_from_bottom', title: I18n.get('auth-change-mobile-verify') },
  screen: RequirementVerifyMobileScreen,
});
