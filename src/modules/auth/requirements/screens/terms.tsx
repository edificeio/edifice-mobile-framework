import React from 'react';

import { type NavigationProp, type StaticScreenProps, useNavigation } from '@react-navigation/native';

import type { NavigationRootParams } from '~/app/navigation/types';
import { defineScreen } from '~/app/navigation-new';
import { openPDFReader } from '~/framework/components/pdf/pdf-reader';
import { useAuthFlows } from '~/modules/auth/flows';
import { usePlatformAuthLegalUrls } from '~/modules/auth/hooks';
import RequirementTermsScreenTemplate from '~/modules/auth/requirements/templates/terms';
import { useAccountWithRequirement } from '~/modules/auth/store/accounts';
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
  const navigation = useNavigation<NavigationProp<NavigationRootParams>>();
  const onOpenLegalUrl = React.useCallback(
    (title: string, url: string) => openPDFReader(navigation, { src: url, title }),
    [navigation],
  );
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
