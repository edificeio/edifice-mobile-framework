import I18n from 'i18n-js';
import * as React from 'react';
import { Dispatch } from 'react';
import { NavigationInjectedProps, NavigationScreenProp, NavigationState } from 'react-navigation';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { PageView } from '~/framework/components/page';

import { HeaderBackAction } from '~/ui/headers/NewHeader';
import {
  changePasswordAction,
  cancelChangePasswordAction,
  initChangePasswordAction,
  IChangePasswordUserInfo,
} from '~/user/actions/changePassword';
import {
  IChangePasswordPageDataProps,
  IChangePasswordPageEventProps,
  IChangePasswordPageProps,
  ChangePasswordPage,
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
    return (
      <PageView
        path={this.props.navigation.state.routeName}
        navBar={{
          left: <HeaderBackAction navigation={this.props.navigation} />,
          title: I18n.t('PasswordChange'),
        }}>
        <ChangePasswordPage {...this.props} key={this.props.version + ''} />
      </PageView>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangePasswordPageContainer);
