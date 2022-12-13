// Libraries
import styled from '@emotion/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { KeyboardPageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { Text, TextBold, TextColorStyle, TextSizeStyle } from '~/framework/components/text';
import { openUrl } from '~/framework/util/linking';
import { tryAction } from '~/framework/util/redux/actions';
import { FlatButton } from '~/ui/FlatButton';
import { ErrorMessage } from '~/ui/Typography';
import { TextInputLine } from '~/ui/forms/TextInputLine';
import { Toggle } from '~/ui/forms/Toggle';

import { ILoginResult, loginAction, markLoginErrorTimestampAction } from '../actions';
import { AuthErrorCode } from '../model';
import { AuthRouteNames, IAuthNavigationParams, redirectLoginNavAction } from '../navigation';
import { IAuthState, getState as getAuthState } from '../reducer';

// TYPES ==========================================================================================

interface ILoginHomeScreenEventProps {
  handleLogin: (...args: Parameters<typeof loginAction>) => Promise<ILoginResult>;
  handleConsumeError: (...args: Parameters<typeof markLoginErrorTimestampAction>) => Promise<void>;
}
interface ILoginHomeScreenProps
  extends ILoginHomeScreenEventProps,
    NativeStackScreenProps<IAuthNavigationParams, AuthRouteNames.loginHome> {
  auth: IAuthState;
}

// State definition -------------------------------------------------------------------------------

export interface ILoginPageState {
  login: string;
  password: string;
  typing: boolean;
  rememberMe: boolean;
  loginState: 'IDLE' | 'RUNNING' | 'DONE';
  error?: AuthErrorCode;
  errorTimestamp?: number; // Last known error timestamp. Used to display error only for the last login attempt.
}

const initialState: ILoginPageState = {
  login: '',
  password: '',
  typing: false,
  rememberMe: true,
  loginState: 'IDLE',
  error: undefined,
  errorTimestamp: undefined,
};

// Main component ---------------------------------------------------------------------------------

const FormContainer = styled.View({
  alignItems: 'center',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  padding: UI_SIZES.spacing.large,
  paddingTop: UI_SIZES.spacing.huge,
});

const styles = StyleSheet.create({
  logoView: { flexGrow: 2, justifyContent: 'center', width: '100%' },
  flex1: { flex: 1 },
  flexGrow1: { flexGrow: 1 },
  sommeNumeriqueInfoBubble: {
    backgroundColor: theme.palette.complementary.red.pale,
    justifyContent: 'center',
    alignItems: 'center',
    padding: UI_SIZES.spacing.minor,
    borderColor: theme.palette.status.failure,
    borderWidth: 1,
    borderRadius: 15,
    width: '90%',
    alignSelf: 'center',
    position: 'absolute',
  },
  sommeNumeriqueInfoBubbleText: { textAlign: 'center', color: theme.palette.status.failure },
  autoLoginWrapper: { flexDirection: 'row', alignSelf: 'flex-end', marginTop: UI_SIZES.spacing.medium },
  autoLoginWrapperText: { marginRight: UI_SIZES.spacing.small, ...TextColorStyle.Normal, ...TextSizeStyle.Small },
  buttonWrapper: {
    alignItems: 'center',
    flexGrow: 2,
    justifyContent: 'flex-start',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLink: { textDecorationLine: 'underline', marginTop: UI_SIZES.spacing.major, ...TextColorStyle.Light },
});

export class LoginHomeScreen extends React.Component<ILoginHomeScreenProps, ILoginPageState> {
  private mounted = false;

  // Refs
  private inputLogin: TextInput | null = null;

  private setInputLoginRef = (el: TextInput) => (this.inputLogin = el);

  private inputPassword: TextInput | null = null;

  private setInputPasswordRef = (el: TextInput) => (this.inputPassword = el);

  // Set default state
  constructor(props: ILoginHomeScreenProps) {
    super(props);
    this.state = { ...initialState, errorTimestamp: Date.now() };
  }

  // Computed properties
  get isSubmitDisabled() {
    return !(this.state.login && this.state.password);
  }

  // Render

  public render() {
    return <KeyboardPageView style={{ backgroundColor: theme.ui.background.card }}>{this.renderForm()}</KeyboardPageView>;
  }

  protected renderLogo = () => {
    const { route } = this.props;
    const { platform } = route.params;
    const logoStyle = { height: 64, width: '100%' };
    if (platform.logoStyle) {
      Object.assign(logoStyle, platform.logoStyle);
    }
    return (
      <View style={styles.logoView}>
        <Picture type={platform.logoType} source={platform.logo} name={platform.logo} style={logoStyle} resizeMode="contain" />
      </View>
    );
  };

  protected renderForm() {
    const { errorTimestamp, error } = this.props.auth;
    const { login, password, typing, rememberMe } = this.state;
    const { route, navigation } = this.props;
    const { platform } = route.params;
    const isSommeNumerique = platform.displayName === 'Somme numérique'; // WTF ??!! 🤪🤪🤪

    return (
      <View style={styles.flex1}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          alwaysBounceVertical={false}
          overScrollMode="never"
          contentContainerStyle={styles.flexGrow1}>
          {/* Temporary banner displayed for Somme Numérique */}
          {isSommeNumerique ? (
            <View style={styles.sommeNumeriqueInfoBubble}>
              <TextBold style={styles.sommeNumeriqueInfoBubbleText}>{I18n.t('common.sommeNumeriqueAlert_temp')}</TextBold>
            </View>
          ) : null}
          <FormContainer>
            {this.renderLogo()}
            <TextInputLine
              inputRef={this.setInputLoginRef}
              placeholder={I18n.t('Login')}
              onChangeText={(value: string) => this.setState({ login: value.trim().toLowerCase(), typing: true })}
              value={login}
              hasError={(error && !typing && !error) as boolean}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
            <TextInputLine
              isPasswordField
              inputRef={this.setInputPasswordRef}
              placeholder={I18n.t('Password')}
              onChangeText={(value: string) => this.setState({ password: value, typing: true })}
              value={password}
              hasError={(error && !typing && !error) as boolean}
            />
            <View style={styles.autoLoginWrapper}>
              <Text style={styles.autoLoginWrapperText}>{I18n.t('AutoLogin')}</Text>
              <Toggle
                checked={rememberMe}
                onCheck={() => this.setState({ rememberMe: true })}
                onUncheck={() => this.setState({ rememberMe: false })}
              />
            </View>
            <ErrorMessage>
              {this.state.typing || (this.state.errorTimestamp !== errorTimestamp && errorTimestamp !== undefined) // errorTimestamp === undefined => redirected from somewhere or autoLogin
                ? ''
                : error &&
                  I18n.t('auth-error-' + error, {
                    version: DeviceInfo.getVersion(),
                    errorcode: error,
                    currentplatform: platform.url,
                    defaultValue: I18n.t('auth-error-other', {
                      version: DeviceInfo.getVersion(),
                      errorcode: error,
                      currentplatform: platform.url,
                    }),
                  })}
            </ErrorMessage>

            <View
              style={[styles.buttonWrapper, { marginTop: error && !typing ? UI_SIZES.spacing.small : UI_SIZES.spacing.medium }]}>
              {(error === 'not_premium' || error === 'pre_deleted') && !this.state.typing ? (
                <FlatButton
                  onPress={() => this.goToWeb()}
                  disabled={false}
                  title={I18n.t('LoginWeb')}
                  loading={false}
                  rightName={{ type: 'NamedSvg', name: 'ui-externalLink' }}
                />
              ) : (
                <FlatButton
                  onPress={() => this.doLogin()}
                  disabled={this.isSubmitDisabled}
                  title={I18n.t('Connect')}
                  loading={this.state.loginState === 'RUNNING' || this.state.loginState === 'DONE'}
                />
              )}

              <View style={styles.center}>
                <Text
                  style={styles.buttonLink}
                  onPress={() => {
                    navigation.navigate('Forgot', { platform, mode: 'password' });
                  }}>
                  {I18n.t('forgot-password')}
                </Text>
                <Text
                  style={styles.buttonLink}
                  onPress={() => {
                    navigation.navigate('Forgot', { platform, mode: 'id' });
                  }}>
                  {I18n.t('forgot-id')}
                </Text>
              </View>
            </View>
          </FormContainer>
        </ScrollView>
      </View>
    );
  }

  // Event handlers

  protected async doLogin() {
    const { route, navigation } = this.props;
    const { platform } = route.params;

    this.setState({ loginState: 'RUNNING' });
    try {
      const redirect = await this.props.handleLogin(
        platform,
        {
          username: this.state.login,
          password: this.state.password,
        },
        this.state.rememberMe,
        this.state.errorTimestamp,
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
    } catch (e) {
      if (this.mounted) this.setState({ typing: false, loginState: 'IDLE' });
    }
  }

  protected goToWeb() {
    const { route } = this.props;
    const { platform } = route.params;
    openUrl(platform.url);
  }

  // Other public methods

  public unfocus() {
    this.inputLogin?.blur();
    this.inputPassword?.blur();
  }

  // If a previous error was thrown without timestamp (ex: autoLogin), make sure to give it a timestamp to show only once.
  consumeErrorIfNeeded() {
    if (this.props.auth.error && this.state.errorTimestamp && this.props.auth.errorTimestamp === undefined) {
      this.props.handleConsumeError(this.props.auth.error, this.state.errorTimestamp);
    }
  }

  componentDidUpdate() {
    this.consumeErrorIfNeeded();
  }

  componentDidMount() {
    this.mounted = true;
    this.consumeErrorIfNeeded();
  }

  componentWillUnmount(): void {
    this.mounted = false;
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
        handleLogin: tryAction(loginAction, undefined, true) as unknown as ILoginHomeScreenEventProps['handleLogin'], // Redux-thunk types suxx
        handleConsumeError: tryAction(
          markLoginErrorTimestampAction,
          undefined,
          false,
        ) as unknown as ILoginHomeScreenEventProps['handleConsumeError'],
      },
      dispatch,
    ),
)(LoginHomeScreen);
