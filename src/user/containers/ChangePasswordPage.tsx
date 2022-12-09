import I18n from 'i18n-js';
import * as React from 'react';
import { Dispatch } from 'react';
import { NavigationInjectedProps, NavigationState } from 'react-navigation';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { PageView } from '~/framework/components/page';
import { getUserSession } from '~/framework/util/session';
import {
  IChangePasswordUserInfo,
  cancelChangePasswordAction,
  changePasswordAction,
  initChangePasswordAction,
} from '~/user/actions/changePassword';
import {
  ChangePasswordPage,
  IChangePasswordPageDataProps,
  IChangePasswordPageEventProps,
  IChangePasswordPageProps,
} from '~/user/components/ChangePasswordPage';
import userConfig from '~/user/config';
import { IChangePasswordState } from '~/user/reducers/changePassword';

const mapStateToProps: (state: any) => IChangePasswordPageDataProps = state => {
  const activationState: IChangePasswordState = state[userConfig.reducerName].changePassword;
  return {
    contextState: activationState.contextState,
    externalError: activationState.submitError || '',
    passwordRegex: activationState.context.passwordRegex,
    submitState: activationState.submitState,
    session: getUserSession(),
    ...state[userConfig.reducerName].changePassword.submitted,
  };
};

const mapDispatchToProps: (
  dispatch: Dispatch<AnyAction | ThunkAction<any, any, void, AnyAction>>,
) => IChangePasswordPageEventProps = dispatch => {
  return {
    dispatch,
    onSubmit: async (model, redirectCallback, forceChange) => {
      dispatch(changePasswordAction(model, redirectCallback, forceChange));
    },
    onCancelLoad() {
      dispatch(cancelChangePasswordAction());
    },
    onRetryLoad: async (arg: IChangePasswordUserInfo) => {
      dispatch(initChangePasswordAction(arg));
    },
  };
};

class ChangePasswordPageContainer extends React.PureComponent<
  IChangePasswordPageProps & { dispatch: any; version: number; navigation: NavigationInjectedProps<NavigationState>['navigation'] },
  object
> {
  public render() {
    // use the key to recompute state from props
    return <ChangePasswordPage {...this.props} key={this.props.version + ''} />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangePasswordPageContainer);
