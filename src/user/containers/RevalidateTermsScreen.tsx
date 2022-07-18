/**
 * Revalidate terms screen
 */
import I18n from 'i18n-js';
import React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { PageView } from '~/framework/components/page';
import { logout } from '~/user/actions/login';

import { checkVersionThenLogin } from '../actions/version';
import { RevalidateTermsScreen } from '../components/RevalidateTermsScreen';
import { userService } from '../service';

// TYPES ==========================================================================================

export interface IRevalidateTermsScreen_EventProps {
  onLogout(): void;
  onLogin(credentials?: { username: string; password: string; rememberMe: boolean }): void;
}
export type IRevalidateTermsScreen_Props = IRevalidateTermsScreen_EventProps & NavigationInjectedProps;

// COMPONENT ======================================================================================

const RevalidateTermsContainer = (props: IRevalidateTermsScreen_Props) => {
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
    <PageView navigation={props.navigation} navBar={navBarInfo}>
      <RevalidateTermsScreen acceptAction={() => revalidateTerms()} refuseAction={() => refuseTerms()} />
    </PageView>
  );
};

// MAPPING ========================================================================================

export default connect(
  () => ({}),
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
