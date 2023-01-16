import * as React from 'react';
import { connect } from 'react-redux';

import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { activationAccount, cancelActivationAccount } from '~/user/actions/activation';
import { initActivationAccount } from '~/user/actions/initActivation';
import {
  ActivationPage,
  IActivationPageDataProps,
  IActivationPageEventProps,
  IActivationPageProps,
} from '~/user/components/ActivationPage';
import userConfig from '~/user/config';
import { IActivationState } from '~/user/reducers/activation';

const mapStateToProps: (state: any) => IActivationPageDataProps = state => {
  const activationState: IActivationState = state[userConfig.reducerName].activation;
  return {
    activationCode: activationState.userinfo.activationCode,
    confirm: activationState.submitted.confirm,
    contextState: activationState.contextState,
    email: activationState.submitted.email,
    emailRequired: activationState.context?.mandatory?.mail,
    externalError: activationState.submitError || '',
    login: activationState.userinfo.login,
    password: activationState.submitted.password,
    passwordRegex: activationState.context.passwordRegex,
    passwordRegexI18n: activationState.context.passwordRegexI18n,
    phone: activationState.submitted.phone,
    phoneRequired: activationState.context?.mandatory?.phone,
    submitState: activationState.submitState,
  };
};

const mapDispatchToProps: (dispatch) => IActivationPageEventProps = dispatch => {
  return {
    dispatch,
    onSubmit(model, rememberMe?: boolean) {
      return dispatch(activationAccount(model, rememberMe));
    },
    onCancelLoad() {
      dispatch(cancelActivationAccount());
    },
    onRetryLoad(arg) {
      dispatch(initActivationAccount(arg, false));
    },
  };
};
class ActivationPageContainer extends React.PureComponent<IActivationPageProps & { dispatch: any; version: number }, object> {
  public render() {
    return <ActivationPage {...this.props} />;
  }
}

const ConnectedActivationPage = connect(mapStateToProps, mapDispatchToProps)(ActivationPageContainer);

export default withViewTracking('auth/activation')(ConnectedActivationPage);
