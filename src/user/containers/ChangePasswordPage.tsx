import I18n from 'i18n-js';
import * as React from 'react';
import { Dispatch } from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { FakeHeader, HeaderCenter, HeaderLeft, HeaderRow, HeaderTitle } from '~/framework/components/header';

import { alternativeNavScreenOptions } from '~/navigation/helpers/navScreenOptions';
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
  IChangePasswordPageProps & { dispatch: any; version: number },
  object
> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => ({
    header: null
  });

  public render() {
    // use the key to recompute state from props
    return (
      <>
        <FakeHeader>
          <HeaderRow>
            <HeaderLeft>
              <HeaderBackAction navigation={this.props.navigation} />
            </HeaderLeft>
            <HeaderCenter>
              <HeaderTitle>{I18n.t('PasswordChange')}</HeaderTitle>
            </HeaderCenter>
          </HeaderRow>
        </FakeHeader>
        <ChangePasswordPage {...this.props} key={this.props.version + ''} navigation={this.props.navigation} />
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangePasswordPageContainer);
