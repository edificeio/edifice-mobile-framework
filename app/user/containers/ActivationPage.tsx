import * as React from "react";
import { connect } from "react-redux";
import { IActivationPageDataProps, ActivationPage, IActivationPageProps, IActivationPageEventProps } from "../components/ActivationPage";
import userConfig from "../config";
import { IActivationState } from "../reducers/activation";
import { activationAccount, initActivationAccount, cancelActivationAccount } from "../actions/activation";

const mapStateToProps: (state: any) => IActivationPageDataProps = state => {
    const activationState: IActivationState = state[userConfig.reducerName].activation;
    return {
        confirm: activationState.submitted.confirm,
        email: activationState.submitted.email,
        phone: activationState.submitted.phone,
        password: activationState.submitted.password,
        activationCode: activationState.userinfo.activationCode,
        login: activationState.userinfo.login,
        passwordRegex: activationState.context.passwordRegex,
        emailRequired: activationState.context.mandatory.mail,
        phoneRequired: activationState.context.mandatory.phone,
        externalError: activationState.submitError || "",
        contextState: activationState.contextState,
        submitState: activationState.submitState
    };
};

const mapDispatchToProps: (dispatch) => IActivationPageEventProps =
    (dispatch) => {
        return {
            dispatch,
            onSubmit(model) {
                return dispatch(activationAccount(model))
            },
            onCancelLoad() {
                dispatch(cancelActivationAccount());
            },
            onRetryLoad(arg) {
                dispatch(initActivationAccount(arg, false))
            }
        };
    };
class ActivationPageContainer extends React.PureComponent<IActivationPageProps & { dispatch: any, version: number }, {}> {
    public render() {
        //use the key to recompute state from props
        return (
            <ActivationPage {...this.props} key={this.props.version + ""} />
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ActivationPageContainer);