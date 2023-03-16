import styled from '@emotion/native';
import I18n from 'i18n-js';
import * as React from 'react';
import { InteractionManager, ScrollView, TextInput, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';
import { KeyboardPageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { CaptionText, SmallText } from '~/framework/components/text';
import { consumeAuthError, loginAction } from '~/framework/modules/auth/actions';
import { AuthRouteNames, redirectLoginNavAction } from '~/framework/modules/auth/navigation';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';
import { openUrl } from '~/framework/util/linking';
import { tryAction } from '~/framework/util/redux/actions';
import { TextInputLine } from '~/ui/forms/TextInputLine';
import { Toggle } from '~/ui/forms/Toggle';

import styles from './styles';
import { LoginHomeScreenDispatchProps, LoginHomeScreenPrivateProps, LoginHomeScreenState } from './types';

const initialState: LoginHomeScreenState = {
  login: '',
  password: '',
  typing: false,
  rememberMe: true,
  loginState: 'IDLE',
  error: undefined, // We stores error retrived via props for display persistence
};

const FormContainer = styled.View({
  alignItems: 'center',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  padding: UI_SIZES.spacing.large,
  paddingTop: UI_SIZES.spacing.huge,
});

export class LoginHomeScreen extends React.Component<LoginHomeScreenPrivateProps, LoginHomeScreenState> {
  private mounted = false;

  private unsubscribeBlur?: () => void;

  private unsubscribeBlurTask?: ReturnType<typeof InteractionManager.runAfterInteractions>;

  private inputLogin: TextInput | null = null;

  private setInputLoginRef = (el: TextInput) => (this.inputLogin = el);

  private inputPassword: TextInput | null = null;

  private setInputPasswordRef = (el: TextInput) => (this.inputPassword = el);

  constructor(props: LoginHomeScreenPrivateProps) {
    super(props);
    this.state = { ...initialState };
  }

  get isSubmitDisabled() {
    return !(this.state.login && this.state.password);
  }

  consumeError() {
    if (this.props.auth.error) {
      this.setState({ error: this.props.auth.error });
      this.props.handleConsumeError();
    }
  }

  resetError() {
    this.setState({ error: undefined });
  }

  componentDidMount() {
    this.mounted = true;
    this.consumeError();
    this.unsubscribeBlur = this.props.navigation.addListener('blur', () => {
      this.unsubscribeBlurTask = InteractionManager.runAfterInteractions(() => {
        this.resetError();
      });
    });
  }

  componentDidUpdate() {
    this.consumeError();
  }

  componentWillUnmount(): void {
    this.mounted = false;
    this.unsubscribeBlur?.();
    this.unsubscribeBlurTask?.cancel();
  }

  onLoginChanged(value: string) {
    this.setState({ login: value.trim().toLowerCase(), typing: true });
    this.resetError();
  }

  onPasswordChanged(value: string) {
    this.setState({ password: value, typing: true });
    this.resetError();
  }

  protected async doLogin() {
    const { route, navigation } = this.props;
    const { platform } = route.params;

    this.setState({ loginState: 'RUNNING' });
    try {
      const redirect = await this.props.handleLogin(
        platform,
        {
          username: this.state.login, // login is already trimmed by inputLine
          password: this.state.password.trim(), // we trim password silently.
        },
        this.state.rememberMe,
      );
      if (redirect) {
        redirectLoginNavAction(redirect, platform, navigation);
        setTimeout(() => {
          // We set timeout to let the app time to navigate before resetting the state of this screen in background
          if (this.mounted) this.setState({ typing: false, loginState: 'IDLE' });
        }, 500);
      } else {
        if (this.mounted) this.setState({ typing: false, loginState: 'DONE' });
      }
    } catch {
      if (this.mounted) this.setState({ typing: false, loginState: 'IDLE' });
    }
  }

  protected goToWeb() {
    const { route } = this.props;
    const { platform } = route.params;
    openUrl(platform.url);
  }

  public unfocus() {
    this.inputLogin?.blur();
    this.inputPassword?.blur();
  }

  protected renderLogo = () => {
    const { route } = this.props;
    const { platform } = route.params;
    const logoStyle = { height: 64, width: '100%' };
    if (platform.logoStyle) {
      Object.assign(logoStyle, platform.logoStyle);
    }
    return (
      <View style={styles.logo}>
        <Picture type={platform.logoType} source={platform.logo} name={platform.logo} style={logoStyle} resizeMode="contain" />
      </View>
    );
  };

  protected renderForm() {
    const { login, password, typing, rememberMe, error } = this.state;
    const { route, navigation } = this.props;
    const { platform } = route.params;

    return (
      <View style={styles.view}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          alwaysBounceVertical={false}
          overScrollMode="never"
          contentContainerStyle={styles.scrollview}>
          <FormContainer>
            {this.renderLogo()}
            <TextInputLine
              inputRef={this.setInputLoginRef}
              placeholder={I18n.t('Login')}
              onChangeText={this.onLoginChanged.bind(this)}
              value={login}
              hasError={!!error}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
            <TextInputLine
              isPasswordField
              inputRef={this.setInputPasswordRef}
              placeholder={I18n.t('Password')}
              onChangeText={this.onPasswordChanged.bind(this)}
              value={password}
              hasError={!!error}
            />
            <View style={styles.inputCheckbox}>
              <CaptionText style={{ marginRight: UI_SIZES.spacing.small }}>{I18n.t('AutoLogin')}</CaptionText>
              <Toggle
                checked={rememberMe}
                onCheck={() => this.setState({ rememberMe: true })}
                onUncheck={() => this.setState({ rememberMe: false })}
              />
            </View>
            <SmallText style={styles.textError}>
              {error
                ? I18n.t('auth-error-' + error, {
                    version: DeviceInfo.getVersion(),
                    errorcode: error,
                    currentplatform: platform.url,
                    defaultValue: I18n.t('auth-error-other', {
                      version: DeviceInfo.getVersion(),
                      errorcode: error,
                      currentplatform: platform.url,
                    }),
                  })
                : ''}
            </SmallText>

            <View
              style={[
                styles.boxButtonAndTextForgot,
                {
                  marginTop: error && !typing ? UI_SIZES.spacing.small : UI_SIZES.spacing.medium,
                },
              ]}>
              {(error === 'not_premium' || error === 'pre_deleted') && !this.state.typing ? (
                <ActionButton
                  action={() => this.goToWeb()}
                  disabled={false}
                  text={I18n.t('LoginWeb')}
                  loading={false}
                  iconName="ui-externalLink"
                />
              ) : (
                <ActionButton
                  action={() => this.doLogin()}
                  disabled={this.isSubmitDisabled}
                  text={I18n.t('Connect')}
                  loading={this.state.loginState === 'RUNNING' || this.state.loginState === 'DONE'}
                />
              )}

              <View style={styles.boxTextForgot}>
                <SmallText
                  style={styles.textForgotPassword}
                  onPress={() => {
                    navigation.navigate(AuthRouteNames.forgot, { platform, mode: 'password' });
                  }}>
                  {I18n.t('forgot-password')}
                </SmallText>
                <SmallText
                  style={styles.textForgotId}
                  onPress={() => {
                    navigation.navigate(AuthRouteNames.forgot, { platform, mode: 'id' });
                  }}>
                  {I18n.t('forgot-id')}
                </SmallText>
              </View>
            </View>
          </FormContainer>
        </ScrollView>
      </View>
    );
  }

  public render() {
    return <KeyboardPageView style={{ backgroundColor: theme.ui.background.card }}>{this.renderForm()}</KeyboardPageView>;
  }
}

export default connect(
  (state: IGlobalState) => {
    return {
      auth: getAuthState(state),
    };
  },
  dispatch =>
    bindActionCreators(
      {
        handleLogin: tryAction(loginAction, undefined, true) as unknown as LoginHomeScreenDispatchProps['handleLogin'], // Redux-thunk types suxx
        handleConsumeError: tryAction(
          consumeAuthError,
          undefined,
          false,
        ) as unknown as LoginHomeScreenDispatchProps['handleConsumeError'],
      },
      dispatch,
    ),
)(LoginHomeScreen);
