/**
 * Revalidate terms screen
 */
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView, PageViewStyle } from '~/framework/components/page';
import { openPDFReader } from '~/framework/components/pdf/pdf-reader';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { HeadingSText, SmallActionText, SmallBoldText, SmallText } from '~/framework/components/text';
import { ILoginResult, loginAction, logoutAction } from '~/framework/modules/auth/actions';
import { ISession, LegalUrls } from '~/framework/modules/auth/model';
import {
  IAuthNavigationParams,
  authRouteNames,
  getAuthNavigationState,
  redirectLoginNavAction,
} from '~/framework/modules/auth/navigation';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';
import { revalidateTerms } from '~/framework/modules/auth/service';
import { tryAction } from '~/framework/util/redux/actions';

// TYPES ==========================================================================================

export interface IRevalidateTermsScreenDataProps {
  session?: ISession;
  legalUrls?: LegalUrls;
}

export interface IRevalidateTermsScreenEventProps {
  tryLogout: (...args: Parameters<typeof logoutAction>) => Promise<void>;
  tryLogin: (...args: Parameters<typeof loginAction>) => Promise<ILoginResult>;
}
export type IRevalidateTermsScreenProps = IRevalidateTermsScreenEventProps &
  IRevalidateTermsScreenDataProps &
  NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.revalidateTerms>;

// COMPONENT ======================================================================================

const styles = StyleSheet.create({
  mustAccept: {
    textAlign: 'center',
    marginTop: UI_SIZES.spacing.small,
  },
  newEULALabel: {
    textAlign: 'center',
    color: theme.palette.primary.regular,
    marginTop: UI_SIZES.spacing.large,
  },
  newEULALink: {
    textDecorationLine: 'underline',
  },
  refuseButton: {
    color: theme.palette.status.failure.regular,
    textAlign: 'center',
  },
});

const RevalidateTermsContainer = (props: IRevalidateTermsScreenProps) => {
  // EVENTS =====================================================================================

  const doRefuseTerms = React.useCallback(async () => {
    try {
      props.tryLogout();
      props.navigation.reset(getAuthNavigationState(props.route.params.platform));
    } catch {
      // console.warn('refuseTerms: could not refuse terms', e);
    }
    // Manually specified deps here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.tryLogout, props.navigation]);

  const doRevalidateTerms = React.useCallback(async () => {
    try {
      if (!props.session) {
        throw new Error('revalidate terms : no active session');
      }
      await revalidateTerms(props.session);
      const platform = props.route.params.platform;
      const credentials = props.route.params.credentials;
      const rememberMe = props.route.params.rememberMe;
      const redirect = await props.tryLogin(platform, credentials, rememberMe);
      redirectLoginNavAction(redirect, platform, props.navigation);
    } catch {
      // console.warn('revalidateTerms: could not revalidate terms', e);
    }
    // Manually specified deps here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation, props.tryLogin]);

  const doOpenCGU = React.useCallback((url?: string) => {
    openPDFReader({
      src: url,
      title: I18n.get('auth-revalidateterms-cgu'),
    });
  }, []);

  // RENDER =======================================================================================

  const imageWidth = UI_SIZES.screen.width - 4 * UI_SIZES.spacing.big;
  const imageHeight = imageWidth / UI_SIZES.aspectRatios.thumbnail;
  const eulaUrl = props.legalUrls?.cgu;

  return (
    <PageView>
      <PageViewStyle
        style={{
          backgroundColor: theme.ui.background.empty,
          paddingTop: UI_SIZES.spacing.huge,
          paddingHorizontal: UI_SIZES.spacing.big,
        }}>
        <View style={{ paddingHorizontal: UI_SIZES.spacing.big }}>
          <View style={{ height: imageHeight }}>
            <NamedSVG name="empty-eula" width={imageWidth} height={imageHeight} />
          </View>
        </View>
        <HeadingSText numberOfLines={2} style={styles.newEULALabel}>
          {I18n.get('user-revalidateterms-neweula')}
        </HeadingSText>
        <SmallText numberOfLines={3} style={styles.mustAccept}>
          {`${I18n.get('user-revalidateterms-mustaccept')} `}
          <SmallActionText onPress={() => doOpenCGU(eulaUrl)} style={styles.newEULALink}>
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
      </PageViewStyle>
    </PageView>
  );
};

// MAPPING ========================================================================================

export default connect(
  (state: IGlobalState) => ({
    session: getAuthState(state).session,
    legalUrls: getAuthState(state).legalUrls,
  }),
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators<IRevalidateTermsScreenEventProps>(
      {
        tryLogout: tryAction(logoutAction),
        tryLogin: tryAction(loginAction),
      },
      dispatch,
    ),
)(RevalidateTermsContainer);
