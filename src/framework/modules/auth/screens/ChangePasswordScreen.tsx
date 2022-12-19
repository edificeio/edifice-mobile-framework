import styled from '@emotion/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { Pressable, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/action-button';
import { UI_SIZES, getScaleDimension } from '~/framework/components/constants';
import { KeyboardPageView } from '~/framework/components/page';
import { SmallBoldText, SmallText, TextSizeStyle } from '~/framework/components/text';
import { Platform } from '~/framework/util/appConf';
import { tryAction } from '~/framework/util/redux/actions';
import { TextInputLine } from '~/ui/forms/TextInputLine';
import { IChangePasswordModel } from '~/user/actions/changePassword';
import { ValidatorBuilder, ValueChange, ValueChangeArgs, ValueGetter } from '~/utils/form';

import { ILoginResult, changePasswordAction, loginAction, logoutAction } from '../actions';
import { IChangePasswordError, IChangePasswordPayload, ISession, createChangePasswordError } from '../model';
import { AuthRouteNames, IAuthNavigationParams, getAuthNavigationState, redirectLoginNavAction } from '../navigation';
import { getState as getAuthState } from '../reducer';

// TYPES ------------------------------------------------------------------------------------------

type IFields = 'oldPassword' | 'newPassword' | 'confirm';

export interface IChangePasswordScreenState extends IChangePasswordModel {
  typing: boolean;
  submitState: 'IDLE' | 'RUNNING' | 'DONE';
  error?: string;
}

export interface IChangePasswordScreenDataProps {
  session?: ISession;
}
export interface IChangePasswordScreenEventProps {
  handleLogin: (...args: Parameters<typeof loginAction>) => Promise<ILoginResult>;
  handleLogout: (...args: Parameters<typeof logoutAction>) => Promise<void>;
  handleSubmit(platform: Platform, payload: IChangePasswordPayload, forceChange?: boolean): Promise<void>;
}
export type IChangePasswordPageProps = IChangePasswordScreenDataProps &
  IChangePasswordScreenEventProps &
  NativeStackScreenProps<IAuthNavigationParams, AuthRouteNames.changePassword>;

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
    return this.errors(model).length === 0;
  }

  blur() {
    if (this.inputOldPassword) this.inputOldPassword.blur();
    if (this.inputNewPassword) this.inputNewPassword.blur();
    if (this.inputPasswordConfirm) this.inputPasswordConfirm.blur();
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

const styles = StyleSheet.create({
  flexGrow1: { flexGrow: 1 },
  flexStretch0: { flexShrink: 0, alignItems: 'stretch' },
  infoBubble: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: UI_SIZES.spacing.tiny,
    flex: 0,
  },
  infoBubbleText: { ...TextSizeStyle.Medium, textAlign: 'center' },
  infoRules: {
    backgroundColor: theme.palette.primary.light,
    paddingVertical: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
    borderRadius: 10,
    flex: 0,
  },
  flexShrink0: { flexShrink: 0 },
  refuse: { color: theme.palette.status.failure, textAlign: 'center' },
  errorMsg: {
    flexGrow: 0,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
    alignSelf: 'center',
    color: theme.palette.status.failure,
    marginTop: 0,
    minHeight: getScaleDimension(20, 'height') * 3,
  },
});

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
const FormContainer = styled.View({
  alignItems: 'stretch',
  flexGrow: 1,
  flexShrink: 0,
  justifyContent: 'space-between',
  paddingTop: UI_SIZES.spacing.big,
  paddingHorizontal: UI_SIZES.spacing.big,
});
const ButtonWrapper = styled.View({
  alignItems: 'center',
  flex: 0,
  justifyContent: 'flex-start',
  marginTop: UI_SIZES.spacing.small,
});
const MiniSpacer = styled.View({
  marginTop: UI_SIZES.spacing.small,
});

export class ChangePasswordScreen extends React.PureComponent<IChangePasswordPageProps, IChangePasswordScreenState> {
  private mounted = false;

  public state: IChangePasswordScreenState = {
    oldPassword: '',
    newPassword: '',
    confirm: '',
    typing: false,
    submitState: 'IDLE',
  };

  private async doSubmit() {
    try {
      this.setState({ typing: false, submitState: 'RUNNING', error: undefined });
      if (!this.props.route.params.credentials) {
        throw createChangePasswordError('change password', I18n.t('changePassword-errorSubmit'));
      }
      const payload = {
        ...this.state,
        login: this.props.route.params.credentials.username,
      };
      await this.props.handleSubmit(this.props.route.params.platform, payload, this.props.route.params.rememberMe);

      const platform = this.props.route.params.platform;
      const credentials = {
        ...this.props.route.params.credentials,
        password: payload.newPassword,
      };
      const rememberMe = this.props.route.params.rememberMe;
      try {
        const redirect = await this.props.handleLogin(platform, credentials, rememberMe);
        redirectLoginNavAction(redirect, platform, this.props.navigation);
        setTimeout(() => {
          // We set timeout to let the app time to navigate before resetting the state of this screen in background
          if (this.mounted) this.setState({ typing: false, submitState: 'IDLE', error: undefined });
        }, 500);
      } catch (e) {
        // If error during the login phase, redirect to login screen
        this.props.handleLogout(this.props.route.params.platform);
        this.props.navigation.reset(getAuthNavigationState(this.props.route.params.platform));
      }
    } catch (e) {
      const changePwdError = e as IChangePasswordError;
      if (this.mounted) this.setState({ typing: false, error: changePwdError.error, submitState: 'IDLE' });
    }
  }

  private onChange = (key: IFields) => {
    return (valueChange: ValueChangeArgs<string>) => {
      const newState: Partial<IChangePasswordScreenState> = {
        [key]: valueChange.value,
        typing: true,
      };
      this.setState(newState as any);
    };
  };

  public doRefuseTerms = async () => {
    try {
      this.props.handleLogout(this.props.route.params.platform);
      this.props.navigation.reset(getAuthNavigationState(this.props.route.params.platform));
    } catch (e) {
      // console.warn('refuseTerms: could not refuse terms', e);
    }
  };

  public render() {
    const { error, submitState } = this.state;
    const { oldPassword, newPassword, confirm, typing } = this.state;

    const formModel = new ChangePasswordFormModel({
      passwordRegex: this.props.route.params.context.passwordRegex,
      oldPassword: () => oldPassword,
      newPassword: () => newPassword,
    });
    const isNotValid = !formModel.validate({ ...this.state });
    const errorKey = formModel.firstErrorKey({ ...this.state });
    const errorText = errorKey ? I18n.t(errorKey) : typing ? '' : error;
    const hasErrorKey = !!errorText;
    const isSubmitLoading = submitState === 'RUNNING';
    const showError = this.state.newPassword.length > 0 || this.state.confirm.length > 0;

    const isIDF = this.props.route.params.platform.displayName === 'MonLycée.net'; // WTF ??!! 🤪🤪🤪

    return (
      <KeyboardPageView scrollable>
        <Pressable onPress={() => formModel.blur()} style={styles.flexGrow1}>
          <FormContainer>
            <View style={styles.flexStretch0}>
              {this.props.route.params.forceChange ? (
                <View style={styles.infoBubble}>
                  <SmallText style={styles.infoBubbleText}>{I18n.t('PasswordChangeWarning')}</SmallText>
                  <MiniSpacer />
                  <MiniSpacer />
                </View>
              ) : null}
              {isIDF ? (
                <View style={styles.infoRules}>
                  <SmallText style={{ color: theme.palette.primary.regular, ...TextSizeStyle.Small }}>
                    {I18n.t('common.idf.passwordRules')}
                  </SmallText>
                </View>
              ) : null}
            </View>
            <View style={styles.flexShrink0}>
              <OldPasswordField oldPassword={oldPassword} form={formModel} onChange={this.onChange('oldPassword')} />
              <MiniSpacer />
            </View>
            <View style={styles.flexShrink0}>
              <NewPasswordField newPassword={newPassword} form={formModel} onChange={this.onChange('newPassword')} />
              <MiniSpacer />
            </View>
            <View style={styles.flexShrink0}>
              <PasswordConfirmField confirm={confirm} form={formModel} onChange={this.onChange('confirm')} />
              <MiniSpacer />
            </View>
            <View style={styles.flexShrink0}>
              <SmallText style={styles.errorMsg}>
                {showError && hasErrorKey && (errorKey !== 'changePassword-errorConfirm' || this.state.confirm.length > 0)
                  ? errorText
                  : ' \n '}
              </SmallText>
            </View>
            <View style={styles.flexShrink0}>
              <ButtonWrapper error={hasErrorKey} typing={typing}>
                <ActionButton
                  action={() => this.doSubmit()}
                  disabled={isNotValid}
                  text={I18n.t('Save')}
                  loading={isSubmitLoading}
                />
              </ButtonWrapper>
              {this.props.route.params.forceChange ? (
                <TouchableOpacity style={{ marginTop: UI_SIZES.spacing.big }} onPress={this.doRefuseTerms}>
                  <SmallBoldText style={styles.refuse}>{I18n.t('user.revalidateTermsScreen.refuseAndDisconnect')}</SmallBoldText>
                </TouchableOpacity>
              ) : null}
              <MiniSpacer />
              <MiniSpacer />
              <MiniSpacer />
            </View>
          </FormContainer>
        </Pressable>
      </KeyboardPageView>
    );
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount(): void {
    this.mounted = false;
  }
}

const mapStateToProps: (state: IGlobalState) => IChangePasswordScreenDataProps = state => {
  return {
    session: getAuthState(state).session,
  };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>) => IChangePasswordScreenEventProps = dispatch => {
  return bindActionCreators(
    {
      handleSubmit: tryAction(changePasswordAction, undefined, true) as unknown as IChangePasswordScreenEventProps['handleSubmit'], // Redux-thunk types suxx,
      handleLogin: tryAction(loginAction, undefined, true) as unknown as IChangePasswordScreenEventProps['handleLogin'], // Redux-thunk types suxx
      handleLogout: tryAction(logoutAction, undefined, true) as unknown as IChangePasswordScreenEventProps['handleLogout'], // Redux-thunk types suxx,
    },
    dispatch,
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ChangePasswordScreen);
