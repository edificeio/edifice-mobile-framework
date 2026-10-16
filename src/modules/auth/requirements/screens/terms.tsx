import React from 'react';

import { type NavigationProp, useNavigation } from '@react-navigation/native';

import type { NavigationRootParams } from '~/app/navigation/types';
import { defineScreen } from '~/app/navigation-new';
import { openPDFReader } from '~/framework/components/pdf/pdf-reader';
import { I18n } from '~/util/i18n';

import { logout, revalidateTerms } from '../../flows';
import { usePlatformAuthLegalUrls } from '../../hooks/use-platform-config';
import { useAccountWithRequirement } from '../../store/accounts';
import RequirementTermsScreenTemplate from '../templates/terms';

/**
 * Requirement: the user must accept the (new) terms of use.
 * Once accepted, the requirement is checked again (see `revalidateTerms`) and the app shows the next step by itself.
 */
const RequirementTermsScreen = React.memo(function ({}) {
  // This screen only shows while there is a connected account with a requirement.
  const platform = useAccountWithRequirement()!.platform.name;
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
  options: { animation: 'slide_from_bottom', title: I18n.get('user-revalidateterms-title') },
  screen: RequirementTermsScreen,
});
