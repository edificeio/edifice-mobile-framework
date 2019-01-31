import * as React from "react";
import style from "glamorous-native";
import { KeyboardAvoidingView, Platform, Alert, Linking } from "react-native";
import Conf from "../../Conf";
import { ValueChangeArgs, InputLogin, InputPassword, InputPasswordConfirm, InputEmail, InputPhone, ActivationFormModel } from "./ActivationForm";
import { ErrorMessage } from "../../ui/Typography";
import I18n from "i18n-js";
import { FlatButton, Loading } from "../../ui";
import { CommonStyles } from "../../styles/common/styles";
import { IActivationModel, IActivationUserInfo } from "../actions/activation";
import { ContextState, SubmitState } from "../reducers/activation";

// TYPES ---------------------------------------------------------------------------

type IFields = "login" | "password" | "confirm" | "phone" | "email";

export interface IActivationPageState extends IActivationModel {
    typing: boolean
}
export interface IActivationPageDataProps extends IActivationModel {
    passwordRegex: string
    emailRequired: boolean
    phoneRequired: boolean
    externalError: string
    contextState: ContextState
    submitState: SubmitState
}
export interface IActivationPageEventProps {
    onSubmit(model: IActivationModel): Promise<void>;
    onRetryLoad: (args: IActivationUserInfo) => void;
    onCancelLoad: () => void;
}
export type IActivationPageProps = IActivationPageDataProps & IActivationPageEventProps;
// Activation Page Component -------------------------------------------------------------

export class ActivationPage extends React.PureComponent<IActivationPageProps, IActivationPageState>{
    //fully controller component
    state: IActivationPageState = {
        ...this.props, typing: false
    }
    private handleActivation = async () => {
        this.props.onSubmit({ ...this.state });
        this.setState({ typing: false });
    }
    private onChange = (key: IFields) => {
        return (valueChange: ValueChangeArgs<string>) => {
            const newState: Partial<IActivationPageState> = { [key]: valueChange.value, typing: true };
            this.setState(newState as any);
        }
    }
    private handleOpenCGU = () => {
        const url = Conf.currentPlatform.cgu;
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                console.log("Don't know how to open URI: ", url);
            }
        });
    }
    componentDidMount() {
        const props = this.props;
        if (this.props.contextState == ContextState.Failed) {
            Alert.alert(I18n.t("ErrorNetwork"), I18n.t("activation-errorLoading"), [
                {
                    text: I18n.t("activation-retryLoad"),
                    onPress() {
                        props.onRetryLoad({ activationCode: props.activationCode, login: props.login });
                    },
                    style: "default"
                }, {
                    text: I18n.t("activation-cancelLoad"),
                    onPress() {
                        props.onCancelLoad();
                    },
                    style: "cancel"
                }
            ])
        }
    }
    render() {
        const { login, password, confirm, email, phone, typing } = this.state;
        const { externalError, contextState, submitState } = this.props;
        if (contextState == ContextState.Loading || contextState == ContextState.Failed) {
            return <Loading />
        }
        const formModel = new ActivationFormModel({ ...this.props, password })
        const isNotValid = !formModel.validate({ ...this.state });
        const errorKey = formModel.firstErrorKey({ ...this.state });
        const errorText = errorKey ? I18n.t(errorKey) : externalError;
        const hasErrorKey = !!errorText;
        const isSubmitLoading = submitState == SubmitState.Loading;
        return <FormPage>
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: "#ffffff" }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}  >
                <FormTouchable
                    onPress={() => formModel.blur()}  >
                    <FormWrapper>
                        <FormContainer>
                            <LogoWrapper>
                                <Logo source={Conf.currentPlatform.logo} ></Logo>
                            </LogoWrapper>
                            <InputLogin login={login} form={formModel} onChange={this.onChange("login")} />
                            <InputPassword password={password} form={formModel} onChange={this.onChange("password")} />
                            <InputPasswordConfirm confirm={confirm} form={formModel} onChange={this.onChange("confirm")} />
                            <InputEmail email={email} form={formModel} onChange={this.onChange("email")} />
                            <InputPhone phone={phone} form={formModel} onChange={this.onChange("phone")} />
                            <ErrorMessage> {hasErrorKey && !typing ? errorText : ""} </ErrorMessage>
                            <ButtonWrapper error={hasErrorKey} typing={typing}>
                                <FlatButton
                                    onPress={() => this.handleActivation()}
                                    disabled={isNotValid}
                                    title={I18n.t("Activate")}
                                    loading={isSubmitLoading}
                                />
                            </ButtonWrapper>
                            <CGULink onPress={this.handleOpenCGU}><CGUText>{I18n.t("activation-cgu")}</CGUText></CGULink>
                        </FormContainer>
                    </FormWrapper>
                </FormTouchable>
            </KeyboardAvoidingView>
        </FormPage>;
    }
}


const FormPage = style.view({
    flex: 1, backgroundColor: "#ffffff"
})
const FormTouchable = style.touchableWithoutFeedback({ flex: 1 })
const FormWrapper = style.view({ flex: 1 })
const FormContainer = style.view({
    alignItems: "center",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    padding: 40,
    paddingTop: 80
});
const LogoWrapper = style.view({ flexGrow: 2, alignItems: "center", justifyContent: "center" })
const Logo = style.image({ height: 50, width: 200, resizeMode: "contain" })
const ButtonWrapper = style.view({
    alignItems: "center",
    flexGrow: 2,
    justifyContent: "flex-start"
}, ({ error, typing }) => ({
    marginTop: error && !typing ? 10 : 30
}));

const CGULink = style.touchableOpacity({
})

const CGUText = style.text({
    color: CommonStyles.lightTextColor,
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 14,
    textAlign: "center",
    textDecorationLine: "underline"
})