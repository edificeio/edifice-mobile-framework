import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import ScrollView from '~/framework/components/scrollView';
import { HeadingSText, SmallActionText, SmallBoldText, SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { I18n } from '~/util/i18n';

import styles from './styles';
import type { RequirementTermsScreenTemplateProps } from './types';

/**
 * The user must accept the (new) terms of use. The template does not know what happens next: it only calls the given actions.
 */
export const RequirementTermsScreenTemplate = React.memo(function ({
  legalUrls,
  onAccept,
  onOpenLegalUrl,
  onRefuse,
}: RequirementTermsScreenTemplateProps) {
  const doRefuseTerms = React.useCallback(async () => {
    try {
      await onRefuse();
    } catch (e) {
      console.error('refuseTerms: could not refuse terms', e);
    }
  }, [onRefuse]);

  const doAcceptTerms = React.useCallback(async () => {
    try {
      await onAccept();
    } catch (e) {
      Toast.showError(I18n.get('toast-error-text'));
      console.error('acceptTerms: could not accept terms', e);
    }
  }, [onAccept]);

  const doOpenLegalUrl = React.useCallback(
    (title: string, url?: string) => {
      if (url) onOpenLegalUrl(title, url);
    },
    [onOpenLegalUrl],
  );

  const imageWidth = UI_SIZES.screen.width - 4 * UI_SIZES.spacing.big;
  const imageHeight = imageWidth / UI_SIZES.aspectRatios.thumbnail;
  const imageContainerStyle = React.useMemo(() => ({ height: imageHeight }), [imageHeight]);

  return (
    <ScrollView>
      <View style={styles.eulaImageContainer}>
        <View style={imageContainerStyle}>
          <Svg name="empty-eula" width={imageWidth} height={imageHeight} />
        </View>
      </View>
      <HeadingSText numberOfLines={2} style={styles.newEULALabel}>
        {I18n.get('user-revalidateterms-neweula')}
      </HeadingSText>
      <SmallText numberOfLines={3} style={styles.mustAccept}>
        {`${I18n.get('user-revalidateterms-mustaccept')} `}
        <SmallActionText
          onPress={() => doOpenLegalUrl(I18n.get('user-legalnotice-usercharter'), legalUrls?.userCharter)}
          style={styles.newEULALink}>
          {I18n.get('user-revalidateterms-newendusercharter')}
        </SmallActionText>
        {` ${I18n.get('user-revalidateterms-and')} `}
        <SmallActionText
          onPress={() => doOpenLegalUrl(I18n.get('auth-revalidateterms-cgu'), legalUrls?.cgu)}
          style={styles.newEULALink}>
          {I18n.get('user-revalidateterms-newenduserlicenseagreement')}
        </SmallActionText>
      </SmallText>
      <PrimaryButton style={styles.acceptButton} text={I18n.get('auth-revalidateterms-accept')} action={doAcceptTerms} />
      <TouchableOpacity style={styles.refuseTouchable} onPress={doRefuseTerms}>
        <SmallBoldText style={styles.refuseButton}>{I18n.get('user-revalidateterms-refuseanddisconnect')}</SmallBoldText>
      </TouchableOpacity>
    </ScrollView>
  );
});
RequirementTermsScreenTemplate.displayName = 'RequirementTermsScreenTemplate';
