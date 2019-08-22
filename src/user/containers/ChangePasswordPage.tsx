import * as React from "react";
import I18n from "i18n-js";
import { connect } from "react-redux";
import { IChangePasswordPageDataProps, IChangePasswordPageEventProps, IChangePasswordPageProps, ChangePasswordPage } from "../components/ChangePasswordPage";
import userConfig from "../config";
import { IChangePasswordState } from "../reducers/changePassword";
import { Dispatch } from "react";
import { AnyAction } from "redux";
import { changePasswordAction, cancelChangePasswordAction, initChangePasswordAction, IChangePasswordUserInfo } from "../actions/changePassword";
import { ThunkAction } from "redux-thunk";
import { NavigationScreenProp } from "react-navigation";
import { standardNavScreenOptions } from "../../navigation/helpers/navHelper";
import { HeaderBackAction } from "../../ui/headers/NewHeader";

const mapStateToProps: (
  state: any
) => IChangePasswordPageDataProps = state => {
  const activationState: IChangePasswordState =
    state[userConfig.reducerName].changePassword;
  return {
    contextState: activationState.contextState,
    externalError: activationState.submitError || "",
    passwordRegex: activationState.context.passwordRegex,
    submitState: activationState.submitState,
    ...state[userConfig.reducerName].changePassword.submitted
  };
};

const mapDispatchToProps: (
  dispatch: Dispatch<AnyAction | ThunkAction<any, any, void, AnyAction>>
) => IChangePasswordPageEventProps = dispatch => {
  return {
    dispatch,
    onSubmit: async (model) => {
      dispatch(changePasswordAction(model));
    },
    onCancelLoad() {
      dispatch(cancelChangePasswordAction());
    },
    onRetryLoad: async (arg: IChangePasswordUserInfo) => {
      dispatch(initChangePasswordAction(arg));
    }
  };
};

class ChangePasswordPageContainer extends React.PureComponent<
  IChangePasswordPageProps & { dispatch: any; version: number },
  {}
  > {

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t("PasswordChange"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerTitleStyle: { marginLeft: 0, marginRight: 'auto', textAlign: 'left' }
      },
      navigation
    );
  };

  public render() {
    // use the key to recompute state from props
    return <ChangePasswordPage {...this.props} key={this.props.version + ""} />;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangePasswordPageContainer);