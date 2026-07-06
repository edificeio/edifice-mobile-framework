/**
 * Revalidate terms screen
 */
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { ModuleScreenProps } from '~/app/navigation/types';
import { screenOptions } from '~/app/navigation/util';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import ScrollView from '~/framework/components/scrollView';
import { HeadingSText, SmallActionText, SmallBoldText, SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { LegalUrls } from '~/framework/modules/auth/model';
import { getPlatformLegalUrls } from '~/framework/modules/auth/redux/reducer';
import { logoutAction, revalidateTermsAction } from '~/framework/modules/auth/thunks';
import { MediaType } from '~/framework/util/media';
import { tryAction } from '~/framework/util/redux/actions';

// TYPES ==========================================================================================

export interface RequirementTermsScreenDataProps {
  legalUrls?: LegalUrls;
}

export interface RequirementTermsScreenEventProps {
  tryLogout: (...args: Parameters<typeof logoutAction>) => Promise<void>;
  tryRevalidate: (...args: Parameters<typeof revalidateTermsAction>) => ReturnType<ReturnType<typeof revalidateTermsAction>>;
}

export type RequirementTermsScreenProps = RequirementTermsScreenEventProps &
  RequirementTermsScreenDataProps &
  ModuleScreenProps<'auth/requirement-terms'>;

export const RequirementTermsScreenOptions = screenOptions(() => ({
  title: I18n.get('user-revalidateterms-title'),
}));

// COMPONENT ======================================================================================

const styles = StyleSheet.create({
  mustAccept: {
    marginTop: UI_SIZES.spacing.small,
    textAlign: 'center',
  },
  newEULALabel: {
    color: theme.palette.primary.regular,
    marginTop: UI_SIZES.spacing.large,
    textAlign: 'center',
  },
  newEULALink: {
    textDecorationLine: 'underline',
  },
  refuseButton: {
    color: theme.palette.status.failure.regular,
    textAlign: 'center',
  },
});

const RequirementTermsScreen = (props: RequirementTermsScreenProps) => {
  // EVENTS =====================================================================================
  const { navigation, tryLogout, tryRevalidate } = props;

  const doRefuseTerms = React.useCallback(async () => {
    try {
      tryLogout();
    } catch (e) {
      console.error('refuseTerms: could not refuse terms', e);
    }
  }, [tryLogout]);

  const doRevalidateTerms = React.useCallback(async () => {
    try {
      await tryRevalidate();
    } catch (e) {
      Toast.showError(I18n.get('toast-error-text'));
      console.error('revalidateTerms: could not revalidate terms', e);
    }
    // Manually specified deps here
  }, [tryRevalidate]);

  const doOpenLegalUrl = React.useCallback(
    (title: string, url?: string) => {
      if (!url) return;
      navigation.navigate('media/carousel', {
        media: [{ mime: 'application/pdf', src: url, type: MediaType.ATTACHMENT }],
        startIndex: 0,
        title,
      });
    },
    [navigation],
  );

  // RENDER =======================================================================================

  const imageWidth = UI_SIZES.screen.width - 4 * UI_SIZES.spacing.big;
  const imageHeight = imageWidth / UI_SIZES.aspectRatios.thumbnail;
  const eulaUrl = props.legalUrls?.cgu;
  const userCharterUrl = props.legalUrls?.userCharter;

  return (
    <ScrollView>
      <View style={{ paddingHorizontal: UI_SIZES.spacing.big }}>
        <View style={{ height: imageHeight }}>
          <Svg name="empty-eula" width={imageWidth} height={imageHeight} />
        </View>
      </View>
      <HeadingSText numberOfLines={2} style={styles.newEULALabel}>
        {I18n.get('user-revalidateterms-neweula')}
      </HeadingSText>
      <SmallText numberOfLines={3} style={styles.mustAccept}>
        {`${I18n.get('user-revalidateterms-mustaccept')} `}
        <SmallActionText
          onPress={() => doOpenLegalUrl(I18n.get('user-legalnotice-usercharter'), userCharterUrl)}
          style={styles.newEULALink}>
          {I18n.get('user-revalidateterms-newendusercharter')}
        </SmallActionText>
        {` ${I18n.get('user-revalidateterms-and')} `}
        <SmallActionText onPress={() => doOpenLegalUrl(I18n.get('auth-revalidateterms-cgu'), eulaUrl)} style={styles.newEULALink}>
          {I18n.get('user-revalidateterms-newenduserlicenseagreement')}
        </SmallActionText>
      </SmallText>
      <PrimaryButton
        style={{ marginTop: UI_SIZES.spacing.large }}
        text={I18n.get('auth-revalidateterms-accept')}
        action={doRevalidateTerms}
      />
      <TouchableOpacity style={{ marginTop: UI_SIZES.spacing.big }} onPress={doRefuseTerms}>
        <SmallBoldText style={styles.refuseButton}>{I18n.get('user-revalidateterms-refuseanddisconnect')}</SmallBoldText>
      </TouchableOpacity>
    </ScrollView>
  );
};

// MAPPING ========================================================================================

export default connect(
  () => ({
    legalUrls: getPlatformLegalUrls(),
  }),
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators<RequirementTermsScreenEventProps>(
      {
        tryLogout: tryAction(logoutAction),
        tryRevalidate: tryAction(revalidateTermsAction),
      },
      dispatch,
    ),
)(RequirementTermsScreen);
