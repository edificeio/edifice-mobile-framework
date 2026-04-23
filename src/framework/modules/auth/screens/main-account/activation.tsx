import * as React from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import { getPlatformContextOf, getPlatformLegalUrlsOf, getValidReactionTypes } from '~/framework/modules/auth/redux/reducer';
import ActivationScreen, {
  AuthActivationScreenDispatchProps,
  AuthActivationScreenProps,
  AuthActivationScreenStoreProps,
} from '~/framework/modules/auth/templates/activation';
import { activateAccountActionAddFirstAccount } from '~/framework/modules/auth/thunks';
import track from '~/framework/modules/auth/tracking';
import { tryAction } from '~/framework/util/redux/actions';

export const AuthActivationScreenOptions = screenOptions(() => ({
  title: I18n.get('auth-navigation-activation-title'),
}));

export const AuthActivationScreen = connect(
  (
    state,
    props: Omit<AuthActivationScreenProps, keyof AuthActivationScreenStoreProps | keyof AuthActivationScreenDispatchProps>,
  ) => {
    return {
      context: getPlatformContextOf(props.route.params.platform),
      legalUrls: getPlatformLegalUrlsOf(props.route.params.platform),
      validReactionTypes: getValidReactionTypes(),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) => {
    return bindActionCreators<AuthActivationScreenDispatchProps>(
      {
        trySubmit: tryAction(activateAccountActionAddFirstAccount, {
          track: track.activation,
        }),
      },
      dispatch,
    );
  },
)(function AuthActivationScreen(props: AuthActivationScreenProps) {
  return <ActivationScreen {...props} />;
});
