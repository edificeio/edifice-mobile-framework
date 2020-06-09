import * as React from "react";
import { connect } from "react-redux";
import {
  activationAccount,
  cancelActivationAccount,
  initActivationAccount
} from "../actions/activation";
import {
  ActivationPage,
  IActivationPageDataProps,
  IActivationPageEventProps,
  IActivationPageProps
} from "../components/ActivationPage";
import userConfig from "../config";
import { IActivationState } from "../reducers/activation";
import withViewTracking from "../../infra/tracker/withViewTracking";

const mapStateToProps: (
  state: any
) => IActivationPageDataProps & { version: number } = state => {
  const activationState: IActivationState =
    state[userConfig.reducerName].activation;
  return {
    activationCode: activationState.userinfo.activationCode,
    confirm: activationState.submitted.confirm,
    contextState: activationState.contextState,
    email: activationState.submitted.email,
    emailRequired: activationState.context.mandatory.mail,
    externalError: activationState.submitError || "",
    login: activationState.userinfo.login,
    password: activationState.submitted.password,
    passwordRegex: activationState.context.passwordRegex,
    phone: activationState.submitted.phone,
    phoneRequired: activationState.context.mandatory.phone,
    submitState: activationState.submitState,
    version: new Date().getTime()
  };
};

const mapDispatchToProps: (
  dispatch
) => IActivationPageEventProps = dispatch => {
  return {
    dispatch,
    onSubmit(model) {
      return dispatch(activationAccount(model));
    },
    onCancelLoad() {
      dispatch(cancelActivationAccount());
    },
    onRetryLoad(arg) {
      dispatch(initActivationAccount(arg, false));
    }
  };
};
class ActivationPageContainer extends React.PureComponent<
  IActivationPageProps & { dispatch: any; version: number },
  {}
> {
  public render() {
    // use the key to recompute state from props
    return <ActivationPage {...this.props} key={this.props.version + ""} />;
  }
}

const ConnectedActivationPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivationPageContainer);

export default withViewTracking('auth/activation')(ConnectedActivationPage);
