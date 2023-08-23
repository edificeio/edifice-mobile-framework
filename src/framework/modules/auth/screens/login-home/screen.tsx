import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { InteractionManager, ScrollView, View } from 'react-native';
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
import { consumeAuthError, loginAction } from '~/framework/modules/auth/actions';
import { AuthErrorCode } from '~/framework/modules/auth/model';
import { IAuthNavigationParams, authRouteNames, redirectLoginNavAction } from '~/framework/modules/auth/navigation';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';
import { navBarOptions } from '~/framework/navigation/navBar';
import { openUrl } from '~/framework/util/linking';
import { handleAction, tryAction } from '~/framework/util/redux/actions';
import { OAuth2ErrorCode } from '~/infra/oauth';

import styles from './styles';
import { LoginHomeScreenDispatchProps, LoginHomeScreenPrivateProps, LoginState } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.loginHome>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('auth-login-title'),
    titleTestID: 'login-title',
    backButtonTestID: 'login-back',
  }),
});

const LoginScreen = (props: LoginHomeScreenPrivateProps) => {
  const { route, navigation } = props;
  const { platform } = route.params;

  const [login, setLogin] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [typing, setTyping] = React.useState<boolean>(false);
  const [rememberMe, setRememberMe] = React.useState<boolean>(true); // We keep the logic for 1 year, after we delete
  const [loginState, setLoginState] = React.useState<string>(LoginState.IDLE);
  const [error, setError] = React.useState<AuthErrorCode>();

  const inputLogin = React.useRef<any>(null);
  const inputPassword = React.useRef<any>(null);
  const mounted = React.useRef(false);
  const unsubscribeBlur = React.useRef<any>(null);
  const unsubscribeBlurTask = React.useRef<any>(null);

  const isSubmitDisabled = React.useMemo(() => !(login && password), [login, password]);

  const consumeError = () => {
    if (props.auth.error) {
      setError(props.auth.error);
      props.handleConsumeError();
    }
  };

  const resetError = () => {
    setError(undefined);
  };

  React.useEffect(() => {
    mounted.current = true;
    const handleBlur = () => {
      unsubscribeBlurTask.current = InteractionManager.runAfterInteractions(() => {
        resetError();
      });
    };

    unsubscribeBlur.current = props.navigation.addListener('blur', handleBlur);

    return () => {
      mounted.current = false;
      unsubscribeBlur.current();
      unsubscribeBlurTask.current?.cancel();
    };
  }, []);

  React.useEffect(() => {
    consumeError();
  });

  const onTextChange = () => {
    setTyping(true);
    resetError();
  };

  const onLoginChanged = value => {
    setLogin(value.trim().toLowerCase());
    onTextChange();
  };

  const onPasswordChanged = value => {
    setPassword(value);
    onTextChange();
  };

  const onSubmitEditingLogin = () => {
    if (inputPassword.current) inputPassword.current.focus();
  };

  const doLogin = async () => {
    setLoginState(LoginState.RUNNING);
    try {
      const loginCredentials = {
        username: login,
        password: password.trim(),
      };

      const redirect = await props.tryLogin(platform, loginCredentials, rememberMe);

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
  };

  const goToWeb = () => {
    openUrl(platform.url);
  };

  const renderError = React.useCallback(() => {
    if (!error) return;
    return (
      <View style={[styles.boxError, styles.userError]}>
        <NamedSVG
          name="ui-error"
          fill={theme.palette.status.failure.regular}
          width={UI_SIZES.elements.icon.default}
          height={UI_SIZES.elements.icon.default}
        />
        <BodyText style={styles.userTextError}>
          {I18n.get('auth-error-' + error!.replaceAll('_', ''), {
            version: DeviceInfo.getVersion(),
            errorcode: error,
            currentplatform: platform.url,
            defaultValue: I18n.get('auth-error-other', {
              version: DeviceInfo.getVersion(),
              errorcode: error,
              currentplatform: platform.url,
            }),
          })}
        </BodyText>
      </View>
    );
  }, [error, platform]);

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
              showError={error && error === OAuth2ErrorCode.BAD_CREDENTIALS}
              onSubmitEditing={onSubmitEditingLogin}
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
              showError={error && error === OAuth2ErrorCode.BAD_CREDENTIALS}
              testID="login-password"
              onSubmitEditing={doLogin}
              testIDToggle="login-see-password"
            />
          }
        />
      </View>
    );
  }, [onLoginChanged, login, error, onPasswordChanged, password, doLogin]);

  const renderLoginButton = React.useCallback(() => {
    if ((error === 'not_premium' || error === 'pre_deleted') && !typing)
      return <PrimaryButton action={goToWeb} text={I18n.get('LoginWeb')} iconRight="ui-externalLink" testID="login-opentoweb" />;
    return (
      <PrimaryButton
        action={doLogin}
        disabled={isSubmitDisabled}
        text={I18n.get('auth-login-connect')}
        loading={loginState === LoginState.RUNNING || loginState === LoginState.DONE}
        testID="login-connect"
      />
    );
  }, [error, typing, isSubmitDisabled, loginState, doLogin, goToWeb]);

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
      auth: getAuthState(state),
    };
  },
  dispatch =>
    bindActionCreators<LoginHomeScreenDispatchProps>(
      {
        tryLogin: tryAction(loginAction),
        handleConsumeError: handleAction(consumeAuthError),
      },
      dispatch,
    ),
)(LoginScreen);
