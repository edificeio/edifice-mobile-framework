import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import type { AuthActivationAddAccountScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { activateAccountActionAddAnotherAccount } from '~/framework/modules/auth/actions';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getPlatformContextOf, getPlatformLegalUrlsOf, getValidReactionTypes } from '~/framework/modules/auth/reducer';
import ActivationScreen from '~/framework/modules/auth/templates/activation';
import { ActivationScreenDispatchProps } from '~/framework/modules/auth/templates/activation/types';
import track from '~/framework/modules/auth/tracking';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.addAccountActivation>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('auth-navigation-activation-title'),
  }),
});
export default connect(
  (state, props: AuthActivationAddAccountScreenPrivateProps) => {
    return {
      context: getPlatformContextOf(props.route.params.platform),
      legalUrls: getPlatformLegalUrlsOf(props.route.params.platform),
      validReactionTypes: getValidReactionTypes(),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>, props: AuthActivationAddAccountScreenPrivateProps) => {
    return bindActionCreators<ActivationScreenDispatchProps>(
      {
        trySubmit: tryAction(activateAccountActionAddAnotherAccount, {
          track: track.activation,
        }),
      },
      dispatch,
    );
  },
)(function AuthActivationScreen(props: AuthActivationAddAccountScreenPrivateProps) {
  return <ActivationScreen {...props} />;
});
