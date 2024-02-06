import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
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
import { consumeAuthErrorAction, loginCredentialsAction } from '~/framework/modules/auth/actions';
import moduleConfig from '~/framework/modules/auth/module-config';
import { IAuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';
import { navBarOptions } from '~/framework/navigation/navBar';
import { Error, useErrorWithKey } from '~/framework/util/error';
import { openUrl } from '~/framework/util/linking';
import { handleAction, tryAction } from '~/framework/util/redux/actions';
import { trackingActionAddSuffix } from '~/framework/util/tracker';

import { AuthPendingRedirection } from '../../model';
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
  const { route, navigation, error, handleConsumeError, tryLogin } = props;
  const { platform } = route.params;

  const [login, setLogin] = React.useState<string>(route.params.login ?? '');
  const [password, setPassword] = React.useState<string>('');
  const [typing, setTyping] = React.useState<boolean>(false);
  const [loginState, setLoginState] = React.useState<string>(LoginState.IDLE);

  const { errmsg, errtype, errkey, errclear } = useErrorWithKey<typeof Error.LoginError>(error, handleConsumeError);

  const inputLogin = React.useRef<any>(null);
  const inputPassword = React.useRef<any>(null);
  const mounted = React.useRef(false);

  const isSubmitDisabled = React.useMemo(() => !(login && password), [login, password]);

  React.useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const doLogin = React.useCallback(async () => {
    setLoginState(LoginState.RUNNING);
    try {
      const loginCredentials = {
        username: login,
        password: password.trim(),
      };

      await tryLogin(platform, loginCredentials, errkey);
      if (mounted) {
        setTyping(false);
        setLoginState(LoginState.DONE);
        setTimeout(() => {
          if (mounted) {
            setTyping(false);
            setLoginState(LoginState.IDLE);
          }
        }, 500);
      }
    } catch {
      if (mounted) {
        setTyping(false);
        setLoginState(LoginState.IDLE);
      }
    }
  }, [login, password, tryLogin, platform, errkey]);

  const goToWeb = React.useCallback(() => {
    openUrl(platform.url);
  }, [platform.url]);

  const onTextChange = React.useCallback(() => {
    setTyping(true);
    errclear();
  }, [errclear]);

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

  const renderError = React.useCallback(() => {
    if (!errmsg) {
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
        <BodyText style={styles.userTextError}>{errmsg}</BodyText>
      </View>
    );
  }, [errmsg]);

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
              showError={errmsg ? errtype === Error.OAuth2ErrorType.CREDENTIALS_MISMATCH : false}
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
              showError={errmsg ? errtype === Error.OAuth2ErrorType.CREDENTIALS_MISMATCH : false}
              testID="login-password"
              onSubmitEditing={onSubmitEditingPassword}
              returnKeyType="send"
              testIDToggle="login-see-password"
            />
          }
        />
      </View>
    );
  }, [onLoginChanged, login, errmsg, errtype, onSubmitEditingLogin, onPasswordChanged, password, onSubmitEditingPassword]);

  const renderLoginButton = React.useCallback(() => {
    if (
      !typing &&
      errmsg &&
      (errtype === Error.LoginErrorType.ACCOUNT_INELIGIBLE_NOT_PREMIUM ||
        errtype === Error.LoginErrorType.ACCOUNT_INELIGIBLE_PRE_DELETED)
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
  }, [typing, errmsg, errtype, goToWeb, doLogin, isSubmitDisabled, loginState]);

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
                action={() => navigation.navigate(authRouteNames.forgot, { platform, mode: 'password', login: route.params.login })}
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
  }, [renderPlatform, renderInputs, renderError, error, renderLoginButton, navigation, platform, route.params.login]);

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
        tryLogin: tryAction(loginCredentialsAction, {
          track: res => [
            moduleConfig,
            res instanceof global.Error
              ? trackingActionAddSuffix('Login credentials', false)
              : res === AuthPendingRedirection.ACTIVATE
                ? trackingActionAddSuffix('Login credentials', 'Activation')
                : res === AuthPendingRedirection.RENEW_PASSWORD
                  ? trackingActionAddSuffix('Login credentials', 'Renouvellement')
                  : trackingActionAddSuffix('Login credentials', true),
            res instanceof global.Error ? Error.getDeepErrorType(res)?.toString() ?? res.toString() : undefined,
          ],
        }),
        handleConsumeError: handleAction(consumeAuthErrorAction),
      },
      dispatch,
    ),
)(LoginCredentialsScreen);
