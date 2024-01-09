import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import InputContainer from '~/framework/components/inputs/container';
import PasswordInput from '~/framework/components/inputs/password';
import TextInput from '~/framework/components/inputs/text';
import { KeyboardPageView } from '~/framework/components/page';
import { NamedSVG, Picture } from '~/framework/components/picture';
import { BodyText, HeadingXSText } from '~/framework/components/text';
import { consumeAuthErrorAction, loginAction } from '~/framework/modules/auth/actions';
// import { AuthErrorCode, getAuthErrorCode } from '~/framework/modules/auth/model';
import { IAuthNavigationParams, authRouteNames, redirectLoginNavAction } from '~/framework/modules/auth/navigation';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';
import { navBarOptions } from '~/framework/navigation/navBar';
import { Error } from '~/framework/util/error';
import { openUrl } from '~/framework/util/linking';
import { handleAction, tryAction } from '~/framework/util/redux/actions';

import styles from './styles';
import { LoginCredentialsScreenDispatchProps, LoginCredentialsScreenPrivateProps, LoginState } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.loginCredentials>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('auth-login-title'),
    titleTestID: 'login-title',
    backButtonTestID: 'login-back',
  }),
});

const LoginCredentialsScreen = (props: LoginCredentialsScreenPrivateProps) => {
  const { route, navigation, error, handleConsumeError } = props;
  const { platform } = route.params;

  const [screenKey, setScreenKey] = React.useState(Math.random());

  const [login, setLogin] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [typing, setTyping] = React.useState<boolean>(false);
  const [loginState, setLoginState] = React.useState<string>(LoginState.IDLE);
  const errorType = React.useMemo(() => Error.getDeepErrorType(error), [error]);
  const showError = error?.key === screenKey || error?.key === undefined;

  const inputLogin = React.useRef<any>(null);
  const inputPassword = React.useRef<any>(null);
  const mounted = React.useRef(false);

  const isSubmitDisabled = React.useMemo(() => !(login && password), [login, password]);

  const resetError = React.useCallback(() => {
    if (error && showError) setScreenKey(Math.random());
    // setError(undefined);
  }, [error, showError]);

  React.useEffect(() => {
    mounted.current = true;
    handleConsumeError(screenKey);

    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doLogin = React.useCallback(async () => {
    setLoginState(LoginState.RUNNING);
    try {
      const loginCredentials = {
        username: login,
        password: password.trim(),
      };

      const redirect = await props.tryLogin(platform, loginCredentials, screenKey);

      if (redirect) {
        redirectLoginNavAction(redirect, platform, navigation);
        setTimeout(() => {
          if (mounted) {
            setTyping(false);
            setLoginState(LoginState.IDLE);
          }
        }, 500);
      } else {
        if (mounted) {
          setTyping(false);
          setLoginState(LoginState.DONE);
        }
      }
    } catch {
      if (mounted) {
        setTyping(false);
        setLoginState(LoginState.IDLE);
      }
    }
  }, [login, navigation, password, platform, props, screenKey]);

  const goToWeb = React.useCallback(() => {
    openUrl(platform.url);
  }, [platform.url]);

  const onTextChange = React.useCallback(() => {
    setTyping(true);
    resetError();
  }, [resetError]);

  const onLoginChanged = React.useCallback(
    (value: string) => {
      setLogin(value.trim().toLowerCase());
      onTextChange();
    },
    [onTextChange],
  );

  const onPasswordChanged = React.useCallback(
    (value: string) => {
      setPassword(value);
      onTextChange();
    },
    [onTextChange],
  );

  const onSubmitEditingLogin = React.useCallback(() => {
    if (inputPassword.current) inputPassword.current.focus();
  }, []);

  const onSubmitEditingPassword = React.useCallback(() => {
    if (!isSubmitDisabled) doLogin();
  }, [doLogin, isSubmitDisabled]);

  const getAuthErrorText = React.useCallback((type?: Error.ErrorTypes<typeof Error.LoginError>) => {
    switch (type) {
      case Error.FetchErrorType.NOT_AUTHENTICATED:
        return I18n.get('auth-error-notinitilized');
      case Error.FetchErrorType.BAD_RESPONSE:
        return I18n.get('auth-error-badresponse');
      case Error.FetchErrorType.NETWORK_ERROR:
        return I18n.get('auth-error-networkerror');
      case Error.FetchErrorType.NOT_OK:
        return I18n.get('auth-error-unknownresponse');

      case Error.OAuth2ErrorType.OAUTH2_INVALID_CLIENT:
        return I18n.get('auth-error-invalidclient', { version: DeviceInfo.getVersion() });
      case Error.OAuth2ErrorType.OAUTH2_MISSING_CLIENT:
        return I18n.get('auth-error-notinitilized');
      case Error.OAuth2ErrorType.OAUTH2_INVALID_GRANT:
        return I18n.get('auth-error-invalidgrant');
      case Error.OAuth2ErrorType.PLATFORM_TOO_LOAD:
        return I18n.get('auth-error-tooload');
      case Error.OAuth2ErrorType.PLATFORM_UNAVAILABLE:
        return I18n.get('auth-error-platformunavailable');
      case Error.OAuth2ErrorType.REFRESH_INVALID:
        return I18n.get('auth-error-restorefail');
      case Error.OAuth2ErrorType.SECURITY_TOO_MANY_TRIES:
        return I18n.get('auth-error-toomanytries');
      case Error.OAuth2ErrorType.UNKNOWN_DENIED:
        return I18n.get('auth-error-unknowndenied');
      case Error.OAuth2ErrorType.CREDENTIALS_MISMATCH:
        return I18n.get('auth-error-badcredentials');
      case Error.OAuth2ErrorType.SAML_INVALID:
        return I18n.get('auth-error-badsaml');
      case Error.OAuth2ErrorType.PLATFORM_BLOCKED_TYPE:
        return I18n.get('auth-error-blockedtype');
      case Error.OAuth2ErrorType.ACCOUNT_BLOCKED:
        return I18n.get('auth-error-blockeduser');

      case Error.LoginErrorType.NO_SPECIFIED_PLATFORM:
      case Error.LoginErrorType.INVALID_PLATFORM:
        return I18n.get('auth-error-runtimeerror');
      case Error.LoginErrorType.ACCOUNT_INELIGIBLE_NOT_PREMIUM:
        return I18n.get('auth-error-notpremium');
      case Error.LoginErrorType.ACCOUNT_INELIGIBLE_PRE_DELETED:
        return I18n.get('auth-error-predeleted');

      case Error.OAuth2ErrorType.SAML_MULTIPLE_VECTOR:
      default:
        return I18n.get('auth-error-unknownerror');
    }
  }, []);

  const renderError = React.useCallback(() => {
    if (!error || !showError) {
      return (
        <View style={styles.boxError}>
          <BodyText style={styles.userTextError}> </BodyText>
        </View>
      );
    }
    return (
      <View style={[styles.boxError, styles.userError]}>
        <NamedSVG
          name="ui-error"
          fill={theme.palette.status.failure.regular}
          width={UI_SIZES.elements.icon.default}
          height={UI_SIZES.elements.icon.default}
        />
        <BodyText style={styles.userTextError}>{getAuthErrorText(errorType)}</BodyText>
      </View>
    );
  }, [error, errorType, getAuthErrorText, showError]);

  const renderPlatform = React.useCallback(() => {
    const logoStyle = {
      ...styles.platformLogo,
    };
    if (platform.logoStyle) Object.assign(logoStyle, platform.logoStyle);
    return (
      <View style={styles.platform}>
        <Picture type={platform.logoType} source={platform.logo} name={platform.logo} style={logoStyle} resizeMode="contain" />
        <HeadingXSText style={styles.platformName}>{platform.displayName}</HeadingXSText>
      </View>
    );
  }, [platform]);

  const renderInputs = React.useCallback(() => {
    return (
      <View style={styles.boxInputs}>
        <InputContainer
          label={{ text: I18n.get('auth-login-login'), icon: 'ui-user' }}
          input={
            <TextInput
              placeholder={I18n.get('auth-login-inputLogin')}
              ref={inputLogin}
              onChangeText={onLoginChanged.bind(this)}
              value={login}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              testID="login-identifier"
              showError={showError && error && errorType === Error.OAuth2ErrorType.CREDENTIALS_MISMATCH}
              onSubmitEditing={onSubmitEditingLogin}
              returnKeyType="next"
            />
          }
        />
        <InputContainer
          style={styles.inputPassword}
          label={{ text: I18n.get('auth-login-password'), icon: 'ui-lock' }}
          input={
            <PasswordInput
              placeholder={I18n.get('auth-login-inputPassword')}
              ref={inputPassword}
              onChangeText={onPasswordChanged.bind(this)}
              value={password}
              showError={showError && error && errorType === Error.OAuth2ErrorType.CREDENTIALS_MISMATCH}
              testID="login-password"
              onSubmitEditing={onSubmitEditingPassword}
              returnKeyType="send"
              testIDToggle="login-see-password"
            />
          }
        />
      </View>
    );
  }, [
    onLoginChanged,
    login,
    error,
    errorType,
    onSubmitEditingLogin,
    onPasswordChanged,
    password,
    showError,
    onSubmitEditingPassword,
  ]);

  const renderLoginButton = React.useCallback(() => {
    if (
      showError &&
      error &&
      !typing &&
      (errorType === Error.LoginErrorType.ACCOUNT_INELIGIBLE_NOT_PREMIUM ||
        errorType === Error.LoginErrorType.ACCOUNT_INELIGIBLE_PRE_DELETED)
    ) {
      return <PrimaryButton action={goToWeb} text={I18n.get('LoginWeb')} iconRight="ui-externalLink" testID="login-opentoweb" />;
    } else {
      return (
        <PrimaryButton
          action={doLogin}
          disabled={isSubmitDisabled}
          text={I18n.get('auth-login-connect')}
          loading={loginState === LoginState.RUNNING || loginState === LoginState.DONE}
          testID="login-connect"
        />
      );
    }
  }, [showError, error, typing, errorType, goToWeb, doLogin, isSubmitDisabled, loginState]);

  const renderPage = React.useCallback(() => {
    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical={false}
        overScrollMode="never"
        contentContainerStyle={styles.scrollview}>
        <View style={styles.form}>
          {renderPlatform()}
          {renderInputs()}
          {renderError()}
          <View style={[styles.boxButtons, !error ? styles.boxButtonsNoError : {}]}>
            {renderLoginButton()}
            <View style={styles.boxTextForgot}>
              <DefaultButton
                text={I18n.get('auth-login-forgot-password')}
                action={() => navigation.navigate(authRouteNames.forgot, { platform, mode: 'password' })}
                testID="login-forgot-password"
                style={styles.forgotPasswordButton}
              />
              <DefaultButton
                text={I18n.get('auth-login-forgot-id')}
                action={() => navigation.navigate(authRouteNames.forgot, { platform, mode: 'id' })}
                testID="login-forgot-identifier"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }, [renderPlatform, renderInputs, renderError, error, renderLoginButton, navigation, platform]);

  return <KeyboardPageView style={styles.pageView}>{renderPage()}</KeyboardPageView>;
};

export default connect(
  (state: IGlobalState) => {
    return {
      error: getAuthState(state).error,
    };
  },
  dispatch =>
    bindActionCreators<LoginCredentialsScreenDispatchProps>(
      {
        tryLogin: tryAction(loginAction),
        handleConsumeError: handleAction(consumeAuthErrorAction),
      },
      dispatch,
    ),
)(LoginCredentialsScreen);
