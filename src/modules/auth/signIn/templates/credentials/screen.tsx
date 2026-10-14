import * as React from 'react';
import { Keyboard, View } from 'react-native';

import { KeyboardAwareScrollView, KeyboardAwareScrollViewRef } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import InputContainer from '~/framework/components/inputs/container';
import PasswordInput from '~/framework/components/inputs/password';
import TextInput from '~/framework/components/inputs/text';
import { PFLogo } from '~/framework/components/pfLogo';
import { Svg } from '~/framework/components/picture';
import { BodyText, HeadingXSText } from '~/framework/components/text';
import { useMounted } from '~/framework/hooks/mounted';
import { AccountErrorCode } from '~/framework/modules/auth/model/error';
import appConf from '~/framework/util/appConf';
import { useErrorWithKey } from '~/framework/util/error';
import { openUrl } from '~/framework/util/linking';
import { OAuth2ErrorCode } from '~/framework/util/oauth2';
import { useSignInStore } from '~/modules/auth/store/signIn';
import { I18n } from '~/util/i18n';

import styles from './styles';
import { LoginState, SignInCredentialsScreenTemplateProps } from './types';
import { useSignInNavigation } from '../../navigation';

export const SignInCredentialsScreenTemplate = React.memo(function ({
  account,
  handleSignIn,
  lockLogin,
  loginUsed,
  platform: _platform,
}: SignInCredentialsScreenTemplateProps) {
  const mounted = useMounted();
  const { navigate } = useSignInNavigation();

  const platform = appConf.assertPlatformOfName(_platform);
  const initialLogin = account?.loginUsed ?? loginUsed ?? '';
  const [login, setLogin] = React.useState<string>(initialLogin);
  const [password, setPassword] = React.useState<string>('');
  const [typing, setTyping] = React.useState<boolean>(false);
  const [loginState, setLoginState] = React.useState<string>(LoginState.IDLE);

  const { clearError, status } = useSignInStore();
  const { errclear, errkey, errmsg, errtype } = useErrorWithKey(platform.url, status?.error, clearError);

  const inputLogin = React.useRef<any>(null);
  const inputPassword = React.useRef<any>(null);
  const isSubmitDisabled = React.useMemo(() => !(login && password), [login, password]);

  const doLogin = React.useCallback(async () => {
    setLoginState(LoginState.RUNNING);
    try {
      const loginCredentials = {
        password: password.trim(),
        username: login,
      };

      await handleSignIn(loginCredentials, errkey, account?.user.id);

      if (mounted) {
        setTyping(false);
        setLoginState(LoginState.DONE);
        // Timemout is added after loggin in to keep spinner visible during screen transition
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
  }, [password, login, handleSignIn, errkey, account?.user.id, mounted]);

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
          <BodyText style={styles.userTextError} testID="login-error" />
        </View>
      );
    }
    return (
      <View style={[styles.boxError, styles.userError]}>
        <Svg
          name="ui-error"
          fill={theme.palette.status.failure.regular}
          width={UI_SIZES.elements.icon.default}
          height={UI_SIZES.elements.icon.default}
        />
        <BodyText style={styles.userTextError} testID="login-error">
          {errmsg}
        </BodyText>
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
        <PFLogo pf={platform} />
        <HeadingXSText style={styles.platformName}>{platform.displayName}</HeadingXSText>
      </View>
    );
  }, [platform]);

  const renderInputs = React.useCallback(() => {
    return (
      <View style={styles.boxInputs}>
        <InputContainer
          label={{ icon: 'ui-user', text: I18n.get('auth-login-login') }}
          input={
            <TextInput
              placeholder={I18n.get('auth-login-inputLogin')}
              ref={inputLogin}
              onChangeText={onLoginChanged}
              value={login}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              testID="login-identifier"
              showError={errmsg ? errtype === OAuth2ErrorCode.CREDENTIALS_MISMATCH : false}
              onSubmitEditing={onSubmitEditingLogin}
              returnKeyType="next"
              disabled={lockLogin && !!initialLogin} // lock Login only if login is provided.
            />
          }
        />
        <InputContainer
          style={styles.inputPassword}
          label={{ icon: 'ui-lock', text: I18n.get('auth-login-password') }}
          input={
            <PasswordInput
              placeholder={I18n.get('auth-login-inputPassword')}
              ref={inputPassword}
              onChangeText={onPasswordChanged}
              value={password}
              showError={errmsg ? errtype === OAuth2ErrorCode.CREDENTIALS_MISMATCH : false}
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
    errmsg,
    errtype,
    onSubmitEditingLogin,
    lockLogin,
    initialLogin,
    onPasswordChanged,
    password,
    onSubmitEditingPassword,
  ]);

  const renderLoginButton = React.useCallback(() => {
    if (
      !typing &&
      errmsg &&
      (errtype === AccountErrorCode.ACCOUNT_INELIGIBLE_NOT_PREMIUM || errtype === AccountErrorCode.ACCOUNT_INELIGIBLE_PRE_DELETED)
    ) {
      return (
        <PrimaryButton action={goToWeb} text={I18n.get('auth-login-web')} iconRight="ui-externalLink" testID="login-opentoweb" />
      );
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

  const insets = useSafeAreaInsets();

  const scrollViewRef = React.useRef<KeyboardAwareScrollViewRef>(null);
  React.useEffect(() => {
    const listener = Keyboard.addListener('keyboardDidShow', () => {
      scrollViewRef.current?.scrollTo(styles.platformLogo.height + styles.platform.paddingTop);
    });
    return () => {
      listener.remove();
    };
  }, []);

  return (
    <KeyboardAwareScrollView
      ref={scrollViewRef}
      keyboardShouldPersistTaps="handled"
      alwaysBounceVertical={false}
      overScrollMode="never"
      contentContainerStyle={React.useMemo(() => [styles.scrollview, { paddingBottom: insets.bottom }], [insets])}>
      {renderPlatform()}
      <View style={styles.form}>
        {renderInputs()}
        {renderError()}
        <View style={styles.boxButtons}>
          {renderLoginButton()}
          <View style={styles.boxTextForgot}>
            <DefaultButton
              text={I18n.get('auth-login-forgot-password')}
              action={() => navigate('signIn/forgot')}
              testID="login-forgot-password"
              style={styles.forgotPasswordButton}
            />
            {!lockLogin ? (
              <DefaultButton
                text={I18n.get('auth-login-forgot-id')}
                action={() => navigate('signIn/forgot')}
                testID="login-forgot-identifier"
              />
            ) : null}
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
});
