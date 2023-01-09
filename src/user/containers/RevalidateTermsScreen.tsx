/**
 * Revalidate terms screen
 */
import I18n from 'i18n-js';
import React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import theme from '~/app/theme';
import { PageView } from '~/framework/components/page';
import { logout } from '~/user/actions/login';
import { checkVersionThenLogin } from '~/user/actions/version';
import { RevalidateTermsScreen } from '~/user/components/RevalidateTermsScreen';
import { userService } from '~/user/service';

import { IUserAuthState } from '../reducers/auth';
import { getAuthState } from '../selectors';

// TYPES ==========================================================================================

export interface IRevalidateTermsScreenDataProps {
  auth: IUserAuthState;
}

export interface IRevalidateTermsScreenEventProps {
  onLogout(): void;
  onLogin(credentials?: { username: string; password: string; rememberMe: boolean }): void;
}
export type IRevalidateTermsScreenProps = IRevalidateTermsScreenDataProps &
  IRevalidateTermsScreenEventProps &
  NavigationInjectedProps;

// COMPONENT ======================================================================================

const RevalidateTermsContainer = (props: IRevalidateTermsScreenProps) => {
  // EVENTS =====================================================================================

  const refuseTerms = async () => {
    try {
      props.onLogout();
    } catch (e) {
      // console.warn('refuseTerms: could not refuse terms', e);
    }
  };

  const revalidateTerms = async () => {
    try {
      await userService.revalidateTerms();
      const credentials = props.navigation.getParam('credentials');
      props.onLogin(credentials);
    } catch (e) {
      // console.warn('revalidateTerms: could not revalidate terms', e);
    }
  };

  // HEADER =====================================================================================

  const navBarInfo = {
    title: I18n.t('user.revalidateTermsScreen.title'),
  };

  // RENDER =======================================================================================

  return (
    <PageView style={{ backgroundColor: theme.ui.background.card }} navigation={props.navigation} navBar={navBarInfo}>
      <RevalidateTermsScreen
        cguUrl={props.auth.legalUrls.cgu}
        acceptAction={() => revalidateTerms()}
        refuseAction={() => refuseTerms()}
      />
    </PageView>
  );
};

// MAPPING ========================================================================================

export default connect(
  (state: any): IRevalidateTermsScreenDataProps => {
    return {
      auth: getAuthState(state),
    };
  },
  dispatch =>
    bindActionCreators(
      {
        onLogout: () => dispatch<any>(logout()),
        onLogin: (credentials?: { username: string; password: string; rememberMe: boolean }) => {
          dispatch<any>(checkVersionThenLogin(false, credentials));
        },
      },
      dispatch,
    ),
)(RevalidateTermsContainer);
