import styled from '@emotion/native';
import I18n from 'i18n-js';
import * as React from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import AlertCard from '~/framework/components/alert';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { KeyboardPageView } from '~/framework/components/page';
import { BodyText, SmallBoldText, SmallText } from '~/framework/components/text';
import { tryAction } from '~/framework/util/redux/actions';
import { Loading } from '~/ui/Loading';
import { TextInputLine } from '~/ui/forms/TextInputLine';
import ChangePasswordFormModel from '~/user/components/change-password/form-model';
import { ContextState, SubmitState } from '~/utils/SubmitState';
import { ValueChange, ValueChangeArgs } from '~/utils/form';

import { changePasswordAction, loginAction, logoutAction } from '../../actions';
import { IChangePasswordError, createChangePasswordError } from '../../model';
import { getAuthNavigationState, redirectLoginNavAction } from '../../navigation';
import { getState as getAuthState } from '../../reducer';
import styles from './styles';
import {
  ChangePasswordScreenDispatchProps,
  ChangePasswordScreenPrivateProps,
  ChangePasswordScreenState,
  ChangePasswordScreenStoreProps,
  IFields,
} from './types';

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

class ChangePasswordScreen extends React.PureComponent<ChangePasswordScreenPrivateProps, ChangePasswordScreenState> {
  private mounted = false;

  public state: ChangePasswordScreenState = {
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // If error during the login phase, redirect to login screen
        this.props.handleLogout();
        this.props.navigation.reset(getAuthNavigationState(this.props.route.params.platform));
      }
    } catch (e) {
      const changePwdError = e as IChangePasswordError;
      if (this.mounted) this.setState({ typing: false, error: changePwdError.error, submitState: 'IDLE' });
    }
  }

  public doRefuseTerms = async () => {
    try {
      this.props.handleLogout();
      this.props.navigation.reset(getAuthNavigationState(this.props.route.params.platform));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // console.warn('refuseTerms: could not refuse terms', e);
    }
  };

  private onChange = (key: IFields) => {
    return (valueChange: ValueChangeArgs<string>) => {
      const newState: Partial<ChangePasswordScreenState> = {
        [key]: valueChange.value,
        typing: true,
      };
      this.setState(newState as any);
    };
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount(): void {
    this.mounted = false;
  }

  public render() {
    const { error, submitState, oldPassword, newPassword, confirm, typing } = this.state;
    const authContext = this.props.route.params.context;

    const formModel = new ChangePasswordFormModel({
      passwordRegex: authContext.passwordRegex,
      oldPassword: () => oldPassword,
      newPassword: () => newPassword,
    });

    const isNotValid = !formModel.validate({ ...this.state });
    const errorKey = formModel.firstErrorKey({ ...this.state });
    const errorText = errorKey ? I18n.t(errorKey) : typing ? '' : error;
    const hasErrorKey = !!errorText;
    const isSubmitLoading = submitState === 'RUNNING';
    const showError = this.state.newPassword.length > 0 || this.state.confirm.length > 0;

    return (
      <KeyboardPageView scrollable style={styles.page}>
        <Pressable onPress={() => formModel.blur()} style={styles.pressable}>
          <FormContainer>
            <View style={styles.viewInfoForm}>
              {this.props.route.params.forceChange ? (
                <View style={styles.viewWarning}>
                  <BodyText style={styles.textWarning}>{I18n.t('PasswordChangeWarning')}</BodyText>
                  <MiniSpacer />
                  <MiniSpacer />
                </View>
              ) : null}

              {authContext.passwordRegexI18n?.[I18n.currentLocale()] ? (
                <AlertCard type="info" text={authContext.passwordRegexI18n?.[I18n.currentLocale()]} />
              ) : null}
            </View>
            <View style={styles.noFlexShrink}>
              <OldPasswordField oldPassword={oldPassword} form={formModel} onChange={this.onChange('oldPassword')} />
              <MiniSpacer />
            </View>
            <View style={styles.noFlexShrink}>
              <NewPasswordField newPassword={newPassword} form={formModel} onChange={this.onChange('newPassword')} />
              <MiniSpacer />
            </View>
            <View style={styles.noFlexShrink}>
              <PasswordConfirmField confirm={confirm} form={formModel} onChange={this.onChange('confirm')} />
              <MiniSpacer />
            </View>
            <View style={styles.noFlexShrink}>
              <SmallText style={styles.textError}>
                {showError && hasErrorKey && (errorKey !== 'changePassword-errorConfirm' || this.state.confirm.length > 0)
                  ? errorText
                  : ' \n '}
              </SmallText>
            </View>

            <View style={styles.noFlexShrink}>
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
}

const mapStateToProps: (state: IGlobalState) => ChangePasswordScreenStoreProps = state => {
  return {
    session: getAuthState(state).session,
  };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>) => ChangePasswordScreenDispatchProps = dispatch => {
  return bindActionCreators(
    {
      handleSubmit: tryAction(
        changePasswordAction,
        undefined,
        true,
      ) as unknown as ChangePasswordScreenDispatchProps['handleSubmit'], // Redux-thunk types suxx,
      handleLogin: tryAction(loginAction, undefined, true) as unknown as ChangePasswordScreenDispatchProps['handleLogin'], // Redux-thunk types suxx
      handleLogout: tryAction(logoutAction, undefined, true) as unknown as ChangePasswordScreenDispatchProps['handleLogout'], // Redux-thunk types suxx,
    },
    dispatch,
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ChangePasswordScreen);
