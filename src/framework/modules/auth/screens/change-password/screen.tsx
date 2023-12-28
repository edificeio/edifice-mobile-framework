import * as React from 'react';
import { Pressable, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import AlertCard from '~/framework/components/alert';
import DefaultButton from '~/framework/components/buttons/default';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import InputContainer from '~/framework/components/inputs/container';
import PasswordInput from '~/framework/components/inputs/password';
import { KeyboardPageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { changePasswordAction, loginAction, logoutAction } from '~/framework/modules/auth/actions';
import { IChangePasswordError, createChangePasswordError } from '~/framework/modules/auth/model';
import { getAuthNavigationState, redirectLoginNavAction } from '~/framework/modules/auth/navigation';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';
import { tryAction } from '~/framework/util/redux/actions';
import { ValueChangeArgs } from '~/utils/form';

import ChangePasswordFormModel from './form-model/component';
import styles from './styles';
import {
  ChangePasswordScreenDispatchProps,
  ChangePasswordScreenPrivateProps,
  ChangePasswordScreenState,
  ChangePasswordScreenStoreProps,
  IFields,
} from './types';

class ChangePasswordScreen extends React.PureComponent<ChangePasswordScreenPrivateProps, ChangePasswordScreenState> {
  private mounted = false;

  public state: ChangePasswordScreenState = {
    oldPassword: '',
    newPassword: '',
    confirm: '',
    typing: false,
    submitState: 'IDLE',
  };

  inputOldPassword = React.createRef<any>();

  inputNewPassword = React.createRef<any>();

  inputConfirmPassword = React.createRef<any>();

  private async doSubmit() {
    try {
      this.setState({ typing: false, submitState: 'RUNNING', error: undefined });
      if (!this.props.route.params.credentials) {
        throw createChangePasswordError('change password', I18n.get('auth-changepassword-error-submit'));
      }
      const payload = {
        ...this.state,
        login: this.props.route.params.credentials.username,
      };
      const { platform, forceChange } = this.props.route.params;
      const redirect = await this.props.trySubmit(platform, payload, forceChange);
      try {
        redirectLoginNavAction(redirect, platform, this.props.navigation);
        setTimeout(() => {
          // We set timeout to let the app time to navigate before resetting the state of this screen in background
          if (this.mounted) this.setState({ typing: false, submitState: 'IDLE', error: undefined });
          Toast.showSuccess(I18n.get('auth-changepassword-success'));
        }, 500);
        if (this.props.route.params.navCallback) {
          this.props.navigation.dispatch(this.props.route.params.navCallback);
        }
      } catch {
        // If error during the login phase, redirect to login screen
        this.props.tryLogout();
        this.props.navigation.reset(getAuthNavigationState(this.props.route.params.platform));
      }
    } catch (e) {
      const changePwdError = e as IChangePasswordError;
      Toast.showError(I18n.get('toast-error-text'));
      if (this.mounted) this.setState({ typing: false, error: changePwdError.error, submitState: 'IDLE' });
    }
  }

  public doRefuseTerms = async () => {
    try {
      this.props.tryLogout();
      this.props.navigation.reset(getAuthNavigationState(this.props.route.params.platform));
    } catch {
      if (__DEV__) console.warn('refuseTerms: could not refuse terms', e);
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
    const errorText = errorKey ? I18n.get(errorKey) : typing ? '' : error;
    const isSubmitLoading = submitState === 'RUNNING';

    return (
      <KeyboardPageView
        scrollable
        scrollViewProps={{ showsVerticalScrollIndicator: false, bounces: false }}
        safeArea
        style={styles.page}>
        <Pressable onPress={() => formModel.blur()} style={styles.pressable}>
          {this.props.route.params.forceChange ? (
            <AlertCard style={styles.alert} type="warning" text={I18n.get('auth-changepassword-warning')} />
          ) : null}

          {authContext.passwordRegexI18n?.[I18n.getLanguage()] ? (
            <View style={styles.infos}>
              <NamedSVG name="ui-lock-alternate" />
              <SmallText style={styles.infosText}>{authContext.passwordRegexI18n?.[I18n.getLanguage()]}</SmallText>
            </View>
          ) : null}
          <InputContainer
            label={{ text: I18n.get('auth-changepassword-password-old'), icon: 'ui-lock' }}
            input={
              <PasswordInput
                placeholder={I18n.get('auth-changepassword-placeholder')}
                showIconCallback
                showError={formModel.showOldPasswordError(oldPassword)}
                value={oldPassword}
                onChangeText={formModel.oldPassword.changeCallback(this.onChange('oldPassword'))}
                annotation=" "
                ref={this.inputOldPassword}
                onSubmitEditing={() => this.inputNewPassword.current.focus()}
                returnKeyType="next"
              />
            }
          />
          <InputContainer
            style={styles.inputNewPassword}
            label={{
              text: I18n.get('auth-changepassword-password-new'),
              icon: 'ui-lock',
            }}
            input={
              <PasswordInput
                placeholder={I18n.get('auth-changepassword-placeholder')}
                showIconCallback
                showError={formModel.showNewPasswordError(newPassword)}
                value={newPassword}
                onChangeText={formModel.newPassword.changeCallback(this.onChange('newPassword'))}
                annotation={formModel.showNewPasswordError(newPassword) ? errorText : ' '}
                ref={this.inputNewPassword}
                onSubmitEditing={() => this.inputConfirmPassword.current.focus()}
                returnKeyType="next"
              />
            }
          />
          <InputContainer
            label={{
              text: I18n.get('auth-changepassword-password-new-confirm'),
              icon: 'ui-lock',
            }}
            input={
              <PasswordInput
                placeholder={I18n.get('auth-changepassword-placeholder')}
                showIconCallback
                showError={formModel.showPasswordConfirmError(confirm)}
                value={confirm}
                onChangeText={formModel.confirm.changeCallback(this.onChange('confirm'))}
                annotation={formModel.showPasswordConfirmError(confirm) ? errorText : ' '}
                ref={this.inputConfirmPassword}
                returnKeyType="send"
                onSubmitEditing={isNotValid ? () => {} : () => this.doSubmit()}
              />
            }
          />
          <View style={styles.buttons}>
            <PrimaryButton
              action={() => this.doSubmit()}
              disabled={isNotValid}
              text={I18n.get('common-save')}
              loading={isSubmitLoading}
            />
            {this.props.route.params.forceChange ? (
              <DefaultButton
                text={I18n.get('user-revalidateterms-refuseanddisconnect')}
                contentColor={theme.palette.status.failure.regular}
                style={{ marginTop: UI_SIZES.spacing.big }}
                action={this.doRefuseTerms}
              />
            ) : null}
          </View>
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
  return bindActionCreators<ChangePasswordScreenDispatchProps>(
    {
      trySubmit: tryAction(changePasswordAction),
      tryLogin: tryAction(loginAction),
      tryLogout: tryAction(logoutAction),
    },
    dispatch,
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ChangePasswordScreen);
