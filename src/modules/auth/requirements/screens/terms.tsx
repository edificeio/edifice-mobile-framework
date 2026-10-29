import React from 'react';

import type { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import { useAuthFlows } from '~/modules/auth/flows';
import { usePlatformAuthLegalUrls } from '~/modules/auth/hooks';
import RequirementTermsScreenTemplate from '~/modules/auth/requirements/templates/terms';
import { useAccountWithRequirement } from '~/modules/auth/store/accounts';
import { useOpenMedia } from '~/modules/media/hooks';
import { I18n } from '~/util/i18n';

/**
 * Requirement: the user must accept the (new) terms of use.
 * Once accepted, the requirement is checked again (see `revalidateTerms`) and the app shows the next step by itself.
 */
const RequirementTermsScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  // This screen only shows while there is a connected account with a requirement.
  const platform = useAccountWithRequirement()!.platform.name;
  const { logout, revalidateTerms } = useAuthFlows();
  const legalUrls = usePlatformAuthLegalUrls(platform);
  const { openPdf } = useOpenMedia();
  const onOpenLegalUrl = React.useCallback((title: string, url: string) => openPdf({ src: url, title }), [openPdf]);
  return (
    <RequirementTermsScreenTemplate
      legalUrls={legalUrls}
      onAccept={revalidateTerms}
      onOpenLegalUrl={onOpenLegalUrl}
      onRefuse={logout}
    />
  );
});
RequirementTermsScreen.displayName = 'RequirementTermsScreen';

export default defineScreen({
  options: () => ({ animation: 'slide_from_bottom', title: I18n.get('user-revalidateterms-title') }),
  screen: RequirementTermsScreen,
});
