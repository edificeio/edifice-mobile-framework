import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { navBarOptions } from '~/framework/navigation/navBar';

import { AuthNavigationParams, authRouteNames } from '../../navigation';
import styles from './styles';
import type { AuthChangeEmailScreenDispatchProps, AuthChangeEmailScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.changeEmail>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('auth-change-email-title'),
});

function AuthChangeEmailScreen(props: AuthChangeEmailScreenPrivateProps) {
  return (
    <PageView>
      <BodyBoldText>auth changeEmail screen</BodyBoldText>
    </PageView>
  );
}

export default connect(
  (state: IGlobalState) => {
    return {};
  },
  dispatch => bindActionCreators({}, dispatch),
)(AuthChangeEmailScreen);
