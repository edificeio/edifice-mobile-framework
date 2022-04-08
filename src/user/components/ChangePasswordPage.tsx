import styled from '@emotion/native';
import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, ScrollView, TextInput, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { Dispatch } from 'redux';



import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { KeyboardPageView } from '~/framework/components/page';
import { Text, TextSizeStyle, remlh } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { IUserSession } from '~/framework/util/session';
import { FlatButton } from '~/ui/FlatButton';
import { Loading } from '~/ui/Loading';
import { ErrorMessage } from '~/ui/Typography';
import { TextInputLine } from '~/ui/forms/TextInputLine';
import { IChangePasswordModel, IChangePasswordUserInfo } from '~/user/actions/changePassword';
import { ContextState, SubmitState } from '~/utils/SubmitState';
import { ValidatorBuilder, ValueChange, ValueChangeArgs, ValueGetter } from '~/utils/form';


// TYPES ------------------------------------------------------------------------------------------

type IFields = 'oldPassword' | 'newPassword' | 'confirm';

export interface IChangePasswordPageState extends IChangePasswordModel {
  typing: boolean;
  showExternalError: boolean;
}

export interface IChangePasswordPageDataProps extends IChangePasswordModel {
  passwordRegex: string;
  externalError: string;
  contextState: ContextState;
  submitState: SubmitState;
  session: IUserSession;
}
export interface IChangePasswordPageEventProps {
  onSubmit(model: IChangePasswordModel, redirectCallback?: (dispatch) => void, forceChange?: boolean): Promise<void>;
  onRetryLoad: (arg: IChangePasswordUserInfo) => void;
  onCancelLoad: () => void;
  dispatch: Dispatch;
}
export type IChangePasswordPageProps = IChangePasswordPageDataProps &
  IChangePasswordPageEventProps &
  NavigationInjectedProps<{
    redirectCallback: (dispatch) => void;
    forceChange?: boolean;
    isLoginNavigator?: boolean;
  }>;

// Form Model -------------------------------------------------------------------------------------

class ChangePasswordFormModel {
  constructor(
    private args: {
      passwordRegex: string;
      oldPassword: ValueGetter<string>;
      newPassword: ValueGetter<string>;
    },
  ) {}
  oldPassword = new ValidatorBuilder().withRequired(true).build<string>();
  newPassword = new ValidatorBuilder()
    .withRequired(true)
    .withRegex(this.args.passwordRegex)
    .withCompareString(this.args.oldPassword, false)
    .build<string>();
  confirm = new ValidatorBuilder().withRequired(true).withCompareString(this.args.newPassword, true).build<string>();

  inputOldPassword?: TextInput;
  inputNewPassword?: TextInput;
  inputPasswordConfirm?: TextInput;

  private check(errors: string[], valid: boolean, errorKey: string = '') {
    if (!valid) {
      errors.push(errorKey);
    }
    return errors;
  }
  errors(model: IChangePasswordModel) {
    const errors: string[] = [];
    this.check(errors, this.oldPassword.isValid(model.oldPassword));
    this.check(errors, this.newPassword.isValid(model.newPassword), 'changePassword-errorRegex');
    this.check(errors, this.confirm.isValid(model.confirm), 'changePassword-errorConfirm');
    return errors;
  }
  firstErrorKey(model: IChangePasswordModel) {
    const errors = this.errors(model);
    return errors.find(err => !!err && err.trim().length > 0);
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
}

// ChangePasswordPage component -------------------------------------------------------------------

export class ChangePasswordPage extends React.PureComponent<IChangePasswordPageProps, IChangePasswordPageState> {
  public state: IChangePasswordPageState = {
    oldPassword: this.props.oldPassword || '',
    newPassword: this.props.newPassword || '',
    confirm: this.props.confirm || '',
    typing: false,
    showExternalError: true,
  };

  private handleSubmit() {
    this.props.onSubmit(
      { ...this.state },
      this.props.navigation.getParam('redirectCallback'),
      this.props.navigation.getParam('forceChange'),
    );
    this.setState({ typing: false, showExternalError: true });
  }

  private onChange = (key: IFields) => {
    return (valueChange: ValueChangeArgs<string>) => {
      const newState: Partial<IChangePasswordPageState> = {
        [key]: valueChange.value,
        typing: true,
        showExternalError: false,
      };
      this.setState(newState as any);
    };
  };

  public componentDidMount() {
    const props = this.props;
    props.onRetryLoad({
      login: props.session.user.login!,
    });
  }

  componentDidUpdate() {
    const props = this.props;
    if (this.props.contextState == ContextState.Failed) {
      Alert.alert(I18n.t('ErrorNetwork'), I18n.t('activation-errorLoading'), [
        {
          text: I18n.t('tryagain'),
          onPress() {
            props.onRetryLoad({
              login: props.session.user.login!,
            });
          },
          style: 'default',
        },
        {
          text: I18n.t('activation-cancelLoad'),
          onPress() {
            props.onCancelLoad();
          },
          style: 'cancel',
        },
      ]);
    }
  }

  public render() {
    const { externalError, contextState, submitState } = this.props;
    const { oldPassword, newPassword, confirm, typing, showExternalError } = this.state;

    if (contextState === ContextState.Loading || contextState === ContextState.Failed) {
      return <Loading />;
    }

    const formModel = new ChangePasswordFormModel({
      ...this.props,
      oldPassword: () => oldPassword,
      newPassword: () => newPassword,
    });
    const isNotValid = !formModel.validate({ ...this.state });
    const errorKey = formModel.firstErrorKey({ ...this.state });
    const errorText = errorKey ? I18n.t(errorKey) : showExternalError && externalError;
    const hasErrorKey = !!errorText;
    const isSubmitLoading = submitState == SubmitState.Loading;
    const showError = this.state.newPassword.length > 0 || this.state.confirm.length > 0;

    const isIDF = DEPRECATED_getCurrentPlatform()!.displayName === 'MonLycée.net'; // WTF ??!! 🤪🤪🤪

    return (
      <View style={{ backgroundColor: theme.color.background.card, flex: 1 }}>
        <KeyboardPageView
          navigation={this.props.navigation}
          style={{
            marginBottom: UI_SIZES.screen.bottomInset,
            flex: 1,
            backgroundColor: theme.color.background.card,
          }}>
          <View style={{ height: '100%' }}>
            <ScrollView
              alwaysBounceVertical={false}
              overScrollMode="never"
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}>
              <FormPage>
                <FormTouchable onPress={() => formModel.blur()}>
                  <FormWrapper>
                    <FormContainer style={{ justifyContent: 'space-between', alignItems: 'stretch' }}>
                      <View style={{ flexShrink: 0, alignItems: 'stretch' }}>
                        {this.props.navigation.getParam('isLoginNavigator') && isIDF ? (
                          <View
                            style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                              padding: 5,
                              flex: 0,
                            }}>
                            <Text style={{ ...TextSizeStyle.SlightBig, textAlign: 'center' }}>
                              {I18n.t('PasswordChangeWarning')}
                            </Text>
                            <MiniSpacer />
                            <MiniSpacer />
                          </View>
                        ) : null}
                        {isIDF ? (
                          <View
                            style={{
                              backgroundColor: theme.color.secondary.light,
                              paddingVertical: 6,
                              paddingHorizontal: 14,
                              borderColor: theme.color.secondary.regular,
                              borderWidth: 1,
                              borderRadius: 10,
                              flex: 0,
                            }}>
                            <Text style={{ color: theme.color.secondary.regular, ...TextSizeStyle.Small }}>
                              {I18n.t('common.idf.passwordRules')}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <View style={{ flexShrink: 0 }}>
                        <OldPasswordField oldPassword={oldPassword} form={formModel} onChange={this.onChange('oldPassword')} />
                        <MiniSpacer />
                      </View>
                      <View style={{ flexShrink: 0 }}>
                        <NewPasswordField newPassword={newPassword} form={formModel} onChange={this.onChange('newPassword')} />
                        <MiniSpacer />
                      </View>
                      <View style={{ flexShrink: 0 }}>
                        <PasswordConfirmField confirm={confirm} form={formModel} onChange={this.onChange('confirm')} />
                        <MiniSpacer />
                      </View>
                      <View style={{ flexShrink: 0 }}>
                        <ErrorMessage style={{ marginTop: 0, minHeight: remlh(3) }}>
                          {showError &&
                          hasErrorKey &&
                          (errorKey !== 'changePassword-errorConfirm' || this.state.confirm.length > 0)
                            ? errorText
                            : ' \n '}
                        </ErrorMessage>
                      </View>
                      <View style={{ flexShrink: 0 }}>
                        <ButtonWrapper error={hasErrorKey} typing={typing}>
                          <FlatButton
                            onPress={() => this.handleSubmit()}
                            disabled={isNotValid}
                            title={I18n.t('Save')}
                            loading={isSubmitLoading}
                          />
                        </ButtonWrapper>
                        <MiniSpacer />
                        <MiniSpacer />
                        <MiniSpacer />
                      </View>
                    </FormContainer>
                  </FormWrapper>
                </FormTouchable>
              </FormPage>
            </ScrollView>
          </View>
        </KeyboardPageView>
      </View>
    );
  }
}

function OldPasswordField(props: { oldPassword: string; form: ChangePasswordFormModel; onChange: ValueChange<string> }) {
  const validator = props.form.oldPassword;
  return (
    <TextInputLine
      isPasswordField
      inputRef={ref => (props.form.inputOldPassword = ref)}
      placeholder={I18n.t('PasswordOld')}
      onChangeText={validator.changeCallback(props.onChange)}
      value={props.oldPassword}
      hasError={props.form.showOldPasswordError(props.oldPassword)}
    />
  );
}
function NewPasswordField(props: { newPassword: string; form: ChangePasswordFormModel; onChange: ValueChange<string> }) {
  const validator = props.form.newPassword;
  return (
    <TextInputLine
      isPasswordField
      inputRef={ref => (props.form.inputNewPassword = ref)}
      placeholder={I18n.t('PasswordNew')}
      onChangeText={validator.changeCallback(props.onChange)}
      value={props.newPassword}
      hasError={props.form.showNewPasswordError(props.newPassword)}
    />
  );
}
function PasswordConfirmField(props: { confirm: string; form: ChangePasswordFormModel; onChange: ValueChange<string> }) {
  const validator = props.form.confirm;
  return (
    <TextInputLine
      isPasswordField
      inputRef={ref => (props.form.inputPasswordConfirm = ref)}
      placeholder={I18n.t('PasswordNewConfirm')}
      onChangeText={validator.changeCallback(props.onChange)}
      value={props.confirm}
      hasError={props.form.showPasswordConfirmError(props.confirm)}
    />
  );
}

const FormPage = styled.View({
  flex: 1,
});
const FormTouchable = styled.TouchableWithoutFeedback({ flex: 1 });
const FormWrapper = styled.View({ flex: 1 });
const FormContainer = styled.View({
  alignItems: 'center',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'flex-start',
  paddingTop: 30,
  paddingHorizontal: 30,
});
const ButtonWrapper = styled.View(
  {
    alignItems: 'center',
    flex: 0,
    justifyContent: 'flex-start',
  },
  ({ error, typing }: { error: boolean; typing: boolean }) => ({
    marginTop: error && !typing ? 10 : 10,
  }),
);
const MiniSpacer = styled.View({
  marginTop: 10,
});