import I18n from "i18n-js";
import * as React from "react";
import style from "glamorous-native";

import { IChangePasswordModel, IChangePasswordUserInfo, changePasswordResetAction } from "../actions/changePassword";
import { ContextState, SubmitState } from "../../utils/SubmitState";
import { ValueChangeArgs, ValidatorBuilder, ValueGetter, ValueChange, IValidatorContext } from "../../utils/form";
import { Alert, TextInput, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { Loading } from "../../ui/Loading";
import { PasswordInputLine } from "../../ui/forms/PasswordInputLine";
import { ErrorMessage } from "../../ui/Typography";
import { FlatButton } from "../../ui/FlatButton";
import { getSessionInfo } from "../../AppStore";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { Dispatch } from "redux";
import { NoTouchableContainer } from "../../ui/ButtonLine";
import { Text } from "../../ui/text";

// TYPES ------------------------------------------------------------------------------------------

type IFields = "oldPassword" | "newPassword" | "confirm";

export interface IChangePasswordPageState extends IChangePasswordModel {
  typing: boolean;
}

export interface IChangePasswordPageDataProps extends IChangePasswordModel {
  passwordRegex: string;
  externalError: string;
  contextState: ContextState;
  submitState: SubmitState;
}
export interface IChangePasswordPageEventProps {
  onSubmit(model: IChangePasswordModel): Promise<void>;
  onRetryLoad: (arg: IChangePasswordUserInfo) => void;
  onCancelLoad: () => void;
  dispatch: Dispatch;
}
export type IChangePasswordPageProps =
  IChangePasswordPageDataProps & IChangePasswordPageEventProps;

// Form Model -------------------------------------------------------------------------------------

class ChangePasswordFormModel {
  constructor(private args: {
    passwordRegex: string,
    newPassword: ValueGetter<string>
  }) {}
  oldPassword = new ValidatorBuilder().withRequired(true).withRegex(this.args.passwordRegex).build<string>();
  newPassword = new ValidatorBuilder().withRequired(true).withRegex(this.args.passwordRegex).build<string>();
  confirm = new ValidatorBuilder().withRequired(true).withMatchString(this.args.newPassword).build<string>();

  inputOldPassword?: TextInput;
  inputNewPassword?: TextInput;
  inputPasswordConfirm?: TextInput;

  private check(errors: string[], valid: boolean, errorKey: string = "") {
    if (!valid) {
      errors.push(errorKey);
    }
    return errors;
  }
  errors(model: IChangePasswordModel) {
    let errors: string[] = [];
    this.check(errors, this.oldPassword.isValid(model.oldPassword));
    this.check(errors, this.newPassword.isValid(model.newPassword));
    this.check(errors, this.confirm.isValid(model.confirm));
    return errors;
  }
  firstErrorKey(model: IChangePasswordModel) {
    const errors = this.errors(model);
    return errors.find(err => !!err && err.trim().length > 0)
  }
  validate(model: IChangePasswordModel) {
    return this.errors(model).length == 0;
  }
  blur() {
    this.inputOldPassword && this.inputOldPassword.blur();
    this.inputNewPassword && this.inputNewPassword.blur();
    this.inputPasswordConfirm && this.inputPasswordConfirm.blur();
  }
  showOldPasswordError(oldPassword: string) {
    return this.oldPassword.isNotValid(oldPassword) && !!oldPassword;
  }
  showNewPasswordError(newPassword: string) {
    return this.newPassword.isNotValid(newPassword) && !!newPassword;
  }
  showPasswordConfirmError(confirm: string) {
    return this.confirm.isNotValid(confirm) && !!confirm;
  }
};

// ChangePasswordPage component -------------------------------------------------------------------

export class ChangePasswordPage extends React.PureComponent<
  IChangePasswordPageProps,
  IChangePasswordPageState
  > {

  public state: IChangePasswordPageState = {
    oldPassword: this.props.oldPassword || "",
    newPassword: this.props.newPassword || "",
    confirm: this.props.confirm || "",
    typing: false
  };

  private handleSubmit() {
    this.props.onSubmit({ ...this.state });
    this.setState({ typing: false });
  }

  private onChange = (key: IFields) => {
    return (valueChange: ValueChangeArgs<string>) => {
      const newState: Partial<IChangePasswordPageState> = {
        [key]: valueChange.value,
        typing: true
      };
      this.setState(newState as any);
    };
  };

  public componentDidMount() {
    const props = this.props;
    if (this.props.contextState == ContextState.Failed) {
      Alert.alert(I18n.t("ErrorNetwork"), I18n.t("activation-errorLoading"), [
        {
          text: I18n.t("tryagain"),
          onPress() {
            props.onRetryLoad({
              login: getSessionInfo().login!
            });
          },
          style: "default"
        },
        {
          text: I18n.t("activation-cancelLoad"),
          onPress() {
            props.onCancelLoad();
          },
          style: "cancel"
        }
      ]);
    }
  }

  public render() {
    const { externalError, contextState, submitState } = this.props;
    const { oldPassword, newPassword, confirm, typing } = this.state;

    if (
      contextState == ContextState.Loading ||
      contextState == ContextState.Failed
    ) {
      return <Loading />;
    }

    const formModel = new ChangePasswordFormModel({
      ...this.props,
      newPassword: () => newPassword
    });
    const isNotValid = !formModel.validate({ ...this.state });
    const errorKey = formModel.firstErrorKey({ ...this.state });
    const errorText = errorKey ? I18n.t(errorKey) : externalError;
    const hasErrorKey = !!errorText;
    const isSubmitLoading = submitState == SubmitState.Loading;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <ConnectionTrackingBar/>
        <FormPage>
          <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#ffffff" }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <FormTouchable onPress={() => formModel.blur()}>
              <FormWrapper>
                <FormContainer>
                  <NoTouchableContainer style={{ paddingHorizontal: 20 }}><Text>{I18n.t("PasswordOld")}</Text></NoTouchableContainer>
                  <OldPasswordField
                    oldPassword={oldPassword}
                    form={formModel}
                    onChange={this.onChange("oldPassword")}
                  />
                  <MiniSpacer/>
                  <NoTouchableContainer style={{ paddingHorizontal: 20 }}><Text>{I18n.t("PasswordNew")}</Text></NoTouchableContainer>
                  <NewPasswordField
                    newPassword={newPassword}
                    form={formModel}
                    onChange={this.onChange("newPassword")}
                  />
                  <MiniSpacer/>
                  <NoTouchableContainer style={{ paddingHorizontal: 20 }}><Text>{I18n.t("PasswordNewConfirm")}</Text></NoTouchableContainer>
                  <PasswordConfirmField
                    confirm={confirm}
                    form={formModel}
                    onChange={this.onChange("confirm")}
                  />
                  <MiniSpacer />
                  <MiniSpacer/>
                  <ButtonWrapper error={hasErrorKey} typing={typing}>
                    <FlatButton
                      onPress={() => this.handleSubmit()}
                      disabled={isNotValid}
                      title={I18n.t("Save")}
                      loading={isSubmitLoading}
                    />
                  </ButtonWrapper>
                  <ErrorMessage>
                    {" "}
                    {hasErrorKey && !typing ? errorText : ""}{" "}
                  </ErrorMessage>
                </FormContainer>
              </FormWrapper>
            </FormTouchable>
          </KeyboardAvoidingView>
        </FormPage>
      </SafeAreaView>
    );
  }
}

function OldPasswordField(
  props: { oldPassword: string, form: ChangePasswordFormModel, onChange: ValueChange<string> }
) {
  const validator = props.form.oldPassword;
  return <PasswordInputLine
    style={{ marginHorizontal: 40, marginTop: -15 }}
    inputRef={(ref) => props.form.inputOldPassword = ref}
    placeholder="●●●●●●●"
    onChangeText={validator.changeCallback(props.onChange)}
    value={props.oldPassword}
    hasError={props.form.showOldPasswordError(props.oldPassword)}
  />
}
function NewPasswordField(
  props: { newPassword: string, form: ChangePasswordFormModel, onChange: ValueChange<string> }
) {
  const validator = props.form.newPassword;
  return <PasswordInputLine
    style={{ marginHorizontal: 40, marginTop: -15 }}
    inputRef={(ref) => props.form.inputNewPassword = ref}
    placeholder="●●●●●●●●●"
    onChangeText={validator.changeCallback(props.onChange)}
    value={props.newPassword}
    hasError={props.form.showNewPasswordError(props.newPassword)}
  />
}
function PasswordConfirmField(
  props: { confirm: string, form: ChangePasswordFormModel, onChange: ValueChange<string> }
) {
  const validator = props.form.confirm;
  return <PasswordInputLine
    style={{ marginHorizontal: 40, marginTop: -15 }}
    inputRef={(ref) => props.form.inputPasswordConfirm = ref}
    placeholder="●●●●●●●●●"
    onChangeText={validator.changeCallback(props.onChange)}
    value={props.confirm}
    hasError={props.form.showPasswordConfirmError(props.confirm)}
  />
}

const FormPage = style.view({
  backgroundColor: "#ffffff",
  flex: 1
});
const FormTouchable = style.touchableWithoutFeedback({ flex: 1 });
const FormWrapper = style.view({ flex: 1 });
const FormContainer = style.view({
  alignItems: "center",
  flex: 1,
  flexDirection: "column",
  justifyContent: "flex-start",
  padding: 0,
  paddingTop: 30
});
const ButtonWrapper = style.view(
  {
    alignItems: "center",
    flex: 0,
    justifyContent: "flex-start"
  },
  ({ error, typing }: { error: boolean, typing: boolean }) => ({
    marginTop: error && !typing ? 10 : 10
  })
);
const MiniSpacer = style.view({
  marginTop: 10
});