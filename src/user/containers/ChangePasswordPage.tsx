import * as React from 'react';
import { Dispatch } from 'react';
import { NavigationInjectedProps, NavigationState } from 'react-navigation';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { getUserSession } from '~/framework/util/session';
import { IChangePasswordUserInfo, changePasswordAction, initChangePasswordAction } from '~/user/actions/changePassword';
import ChangePasswordPage, {
  IChangePasswordPageDataProps,
  IChangePasswordPageEventProps,
  IChangePasswordPageProps,
} from '~/user/components/change-password';
import userConfig from '~/user/config';
import { IChangePasswordState } from '~/user/reducers/changePassword';

const mapStateToProps: (state: any) => IChangePasswordPageDataProps = state => {
  const activationState: IChangePasswordState = state[userConfig.reducerName].changePassword;
  return {
    contextState: activationState.contextState,
    externalError: activationState.submitError || '',
    passwordRegex: activationState.context.passwordRegex,
    passwordRegexI18n: activationState.context.passwordRegexI18n,
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
