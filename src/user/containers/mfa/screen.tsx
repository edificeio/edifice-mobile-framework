import I18n from 'i18n-js';
import * as React from 'react';
import { ActivityIndicator, Alert, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import theme from '~/app/theme';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen } from '~/framework/components/emptyConnectionScreen';
import { KeyboardPageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { BodyBoldText, BodyText, HeadingLText, HeadingSText, SmallText } from '~/framework/components/text';
import { IUpdatableProfileValues, profileUpdateAction } from '~/user/actions/profile';
import { checkVersionThenLogin } from '~/user/actions/version';
import { userService } from '~/user/service';

import styles from './styles';
import { CodeState, MFAScreenProps, ResendResponse } from './types';

const MFAScreen = (props: MFAScreenProps) => {
  const { onLogin, onUpdateProfile, navigation } = props;

  const credentials = navigation.getParam('credentials');
  const email = navigation.getParam('email');
  const isModifyingEmail = navigation.getParam('isModifyingEmail');
  const hasConnection = navigation.getParam('connection') ?? true;

  const [isVerifyingEnabled, setIsVerifyingEnabled] = React.useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = React.useState(false);
  const [isResendDisabled, setIsResendDisabled] = React.useState(true);
  const [isResendingVerificationCode, setIsResendingVerificationCode] = React.useState(false);
  const [isCodeStateHidden, setIsCodeStateHidden] = React.useState(true);
  const [code, setCode] = React.useState('');
  const [codeState, setCodeState] = React.useState<CodeState>(CodeState.PRISTINE);

  const CELL_COUNT = 6;
  const codeFieldRef = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
  const [codeFieldProps, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: setCode,
  });

  const isCodeComplete = code.length === CELL_COUNT;
  const isCodeCorrect = codeState === CodeState.CODE_CORRECT;
  const isCodeStateUnknown = codeState === CodeState.CODE_STATE_UNKNOWN;
  const isVerifyingActive = isVerifyingEnabled || isVerifyingCode;
  const isResendInactive = isResendDisabled || isResendingVerificationCode || isVerifyingActive || isCodeCorrect;
  const isCodeStateDisplayed = !(isCodeStateHidden || isVerifyingActive || isCodeStateUnknown);

  const codeStateColor = theme.palette.status[isCodeCorrect ? 'success' : 'failure'].regular;
  const resendOpacity = isResendInactive ? 0.5 : 1;

  const setResendTimer = () => {
    setIsResendDisabled(true);
    setTimeout(() => {
      setIsResendDisabled(false);
    }, 15000);
  };

  const setVerifyTimer = () => {
    setIsVerifyingEnabled(true);
    setTimeout(() => {
      setIsVerifyingEnabled(false);
    }, 500);
  };

  const verifyCode = async (toVerify: string) => {
    try {
      setIsVerifyingCode(true);
      await userService.verifyEmailCode(toVerify);
      const emailValidationInfos = await userService.getEmailValidationInfos();
      const isValid = emailValidationInfos?.emailState?.state === 'valid';
      const isOutdated = emailValidationInfos?.emailState?.ttl === 0;
      const hasNoTriesLeft = emailValidationInfos?.emailState?.tries === 0;
      if (isValid) {
        setCodeState(CodeState.CODE_CORRECT);
      } else if (isOutdated || hasNoTriesLeft) {
        setCodeState(CodeState.CODE_EXPIRED);
      } else setCodeState(CodeState.CODE_WRONG);
    } catch {
      setCodeState(CodeState.CODE_STATE_UNKNOWN);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const verifyTypedCode = () => {
    if (isCodeComplete) {
      setVerifyTimer();
      verifyCode(code);
      setIsCodeStateHidden(false);
    }
  };

  const resetCode = () => {
    setCode('');
    codeFieldRef?.current?.focus();
    setIsCodeStateHidden(true);
  };

  const resendVerificationCode = async () => {
    try {
      setIsResendingVerificationCode(true);
      await userService.sendEmailVerificationCode(email);
      return ResendResponse.SUCCESS;
    } catch {
      return ResendResponse.FAIL;
    } finally {
      setIsResendingVerificationCode(false);
    }
  };

  const resendCode = async () => {
    setResendTimer();
    const resendResponse = await resendVerificationCode();
    if (resendResponse === ResendResponse.FAIL) {
      Toast.show(I18n.t('common.error.text'), {
        onHidden: () => setIsResendDisabled(false),
        ...UI_ANIMATIONS.toast,
      });
    } else if (resendResponse === ResendResponse.SUCCESS) {
      Toast.show(I18n.t('user-mfa-toast'), {
        ...UI_ANIMATIONS.toast,
      });
    }
  };

  const displayConfirmationAlert = () => {
    if (isModifyingEmail) {
      Alert.alert(I18n.t('user-mfa-edit-alert-title'), I18n.t('user-mfa-edit-alert-message'), [
        {
          text: I18n.t('common.discard'),
          onPress: () => navigation.navigate('Profile'),
          style: 'destructive',
        },
        {
          text: I18n.t('common.continue'),
          style: 'cancel',
        },
      ]);
    } else return true;
  };

  React.useEffect(() => setResendTimer(), []);

  React.useEffect(() => {
    if (!isVerifyingActive) {
      if (isCodeStateUnknown) {
        Toast.show(I18n.t('common.error.text'), {
          onHidden: () => setCode(''),
          ...UI_ANIMATIONS.toast,
        });
      } else if (isCodeCorrect) {
        const redirectUser = async () => {
          if (isModifyingEmail) {
            navigation.navigate('Profile');
            onUpdateProfile({ email });
          } else {
            setTimeout(() => {
              try {
                onLogin(credentials);
              } catch {
                Toast.show(I18n.t('common.error.text'), {
                  onHidden: () => resetCode(),
                  ...UI_ANIMATIONS.toast,
                });
              }
            }, 500);
          }
        };
        redirectUser();
      }
    }
  }, [
    isVerifyingActive,
    isCodeStateUnknown,
    isCodeCorrect,
    isModifyingEmail,
    navigation,
    onUpdateProfile,
    email,
    onLogin,
    credentials,
    resetCode,
  ]);

  return (
    <KeyboardPageView
      isFocused={false}
      style={styles.page}
      scrollable
      navigation={navigation}
      navBarWithBack={{ title: isModifyingEmail ? I18n.t('user-mfa-edit') : I18n.t('user-mfa-verify') }}
      onBack={() => displayConfirmationAlert()}>
      {hasConnection ? (
        <View style={styles.container}>
          <View style={styles.contentContainer}>
            <View style={styles.imageContainer}>
              <NamedSVG name="empty-email" width={UI_SIZES.elements.thumbnail} height={UI_SIZES.elements.thumbnail} />
            </View>
            <HeadingSText style={styles.title}>{I18n.t('user-mfa-title')}</HeadingSText>
            <SmallText style={styles.contentSent}>{`${I18n.t('user-mfa-message-sent')} ${email}.`}</SmallText>
            <SmallText style={styles.content}>{I18n.t('user-mfa-message')}</SmallText>
            <View pointerEvents="box-none" style={styles.codeFieldContainer}>
              <CodeField
                {...codeFieldProps}
                ref={codeFieldRef}
                caretHidden={code.length > 0}
                cellCount={CELL_COUNT}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                renderCell={({ index, symbol, isFocused }) => (
                  <HeadingLText
                    key={index}
                    style={[
                      styles.codeFieldCell,
                      {
                        borderColor: isCodeStateDisplayed
                          ? codeStateColor
                          : isFocused
                          ? theme.palette.grey.graphite
                          : theme.palette.grey.stone,
                      },
                    ]}
                    onLayout={getCellOnLayoutHandler(index)}>
                    {symbol || (isFocused ? <Cursor /> : null)}
                  </HeadingLText>
                )}
                value={code}
                onChangeText={setCode}
                onBlur={() => verifyTypedCode()}
              />
              {/* Note: the CodeField's "editable" prop is not sufficient to prevent the user from typing, so an invisible absolute View is used instead.*/}
              {isCodeComplete ? (
                <TouchableWithoutFeedback
                  disabled={isVerifyingActive || isCodeCorrect || isCodeStateUnknown}
                  onPress={() => resetCode()}>
                  <View style={styles.codeFieldWrapper} />
                </TouchableWithoutFeedback>
              ) : null}
            </View>
            <View style={styles.feedbackContainer}>
              {isVerifyingActive ? (
                <ActivityIndicator size="large" color={theme.palette.primary.regular} />
              ) : isCodeStateDisplayed ? (
                <>
                  <Picture
                    type="NamedSvg"
                    name={`pictos-${isCodeCorrect ? 'success-outline' : 'error'}`}
                    fill={codeStateColor}
                    width={33}
                    height={33}
                  />
                  <BodyText style={[styles.codeStateText, { color: codeStateColor }]}>
                    {I18n.t(`user-mfa-feedback-${codeState.toLowerCase()}`)}
                  </BodyText>
                </>
              ) : null}
            </View>
          </View>
          <View style={styles.resendContainer}>
            <SmallText style={styles.issueText}>{I18n.t('user-mfa-issue')}</SmallText>
            <TouchableOpacity
              style={[styles.resendButton, { opacity: resendOpacity }]}
              disabled={isResendInactive}
              onPress={() => resendCode()}>
              <Picture
                type="NamedSvg"
                name="pictos-redo"
                fill={theme.palette.grey.black}
                width={UI_SIZES.dimensions.width.medium}
                height={UI_SIZES.dimensions.height.medium}
              />
              <BodyBoldText style={styles.resendText}>{I18n.t('user-mfa-resend')}</BodyBoldText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <EmptyConnectionScreen />
      )}
    </KeyboardPageView>
  );
};

export default connect((dispatch: ThunkDispatch<any, void, AnyAction>) => ({
  onLogin: (credentials?: { username: string; password: string; rememberMe: boolean }) => {
    dispatch(checkVersionThenLogin(false, credentials));
  },
  onUpdateProfile(updatedProfileValues: IUpdatableProfileValues) {
    dispatch(profileUpdateAction(updatedProfileValues));
  },
  dispatch,
}))(MFAScreen);
