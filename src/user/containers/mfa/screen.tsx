import I18n from 'i18n-js';
import Lottie from 'lottie-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import Toast from 'react-native-tiny-toast';
import { StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import theme from '~/app/theme';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { KeyboardPageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { BodyBoldText, BodyText, HeadingLText, HeadingSText, SmallText } from '~/framework/components/text';
import { IUpdatableProfileValues, profileUpdateAction } from '~/user/actions/profile';
import { checkVersionThenLogin } from '~/user/actions/version';
import { userService } from '~/user/service';

import { ModificationType } from '../user-account/types';
import styles from './styles';
import { CodeState, MFAScreenProps, ResendResponse } from './types';

const MFAScreen = (props: MFAScreenProps) => {
  const { onLogin, onUpdateProfile, navigation } = props;

  const navBarTitle = navigation.getParam('navBarTitle');
  const credentials = navigation.getParam('credentials');
  const email = navigation.getParam('email');
  const mobile = navigation.getParam('mobile');
  const isEmailMFA = navigation.getParam('isEmailMFA');
  const isMobileMFA = navigation.getParam('isMobileMFA');
  const isModifyingEmail = navigation.getParam('isModifyingEmail');
  const modificationType = navigation.getParam('modificationType');
  const isEmailOrMobileMFA = isEmailMFA || isMobileMFA;

  const [isVerifyingEnabled, setIsVerifyingEnabled] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isResendingVerificationCode, setIsResendingVerificationCode] = useState(false);
  const [isCodeStateHidden, setIsCodeStateHidden] = useState(true);
  const [code, setCode] = useState('');
  const [codeState, setCodeState] = useState<CodeState>(CodeState.PRISTINE);
  const [animationSource, setAnimationSource] = useState(require('ASSETS/animations/mfa/code-correct.json'));
  const animationRef = useRef<Lottie>(null);

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

  const texts: Record<string, any> = isEmailMFA
    ? {
        title: I18n.t('user-mfa-email-title'),
        messageSent: `${I18n.t('user-mfa-email-message-sent')} ${email}.`,
        message: I18n.t('user-mfa-email-message'),
        feedback: I18n.t(`user-mfa-email-feedback-${codeState.toLowerCase()}`),
        resendToast: I18n.t('user-mfa-email-toast'),
      }
    : isMobileMFA
    ? {
        title: I18n.t('user-mfa-mobile-title'),
        messageSent: `${I18n.t('user-mfa-mobile-message-sent')} ${mobile}.`,
        message: I18n.t('user-mfa-mobile-message'),
        feedback: I18n.t(`user-mfa-mobile-feedback-${codeState.toLowerCase()}`),
        resendToast: I18n.t('user-mfa-mobile-toast'),
      }
    : {
        title: I18n.t('user-mfa-title'),
        messageSent: `${I18n.t('user-mfa-message-sent')} ${mobile}.`,
        message: I18n.t('user-mfa-message'),
        feedback: I18n.t(`user-mfa-feedback-${codeState.toLowerCase()}`),
        resendToast: I18n.t('user-mfa-toast'),
      };

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

  const startAnimation = (state: CodeState) => {
    const animationSources = {
      [CodeState.CODE_CORRECT]: require('ASSETS/animations/mfa/code-correct.json'),
      [CodeState.CODE_EXPIRED]: require('ASSETS/animations/mfa/code-wrong-locked.json'),
      [CodeState.CODE_WRONG]: require('ASSETS/animations/mfa/code-wrong.json'),
      [CodeState.CODE_RESENT]: require('ASSETS/animations/mfa/code-wrong-unlocked.json'),
    };
    setAnimationSource(animationSources[state]);
    animationRef.current?.play();
  };

  const verifyCode = async (toVerify: string) => {
    try {
      setIsVerifyingCode(true);
      let validationInfos;
      let state;
      if (isEmailMFA) {
        await userService.verifyEmailCode(toVerify);
        validationInfos = await userService.getEmailValidationInfos();
        state = validationInfos?.emailState;
      } else if (isMobileMFA) {
        await userService.verifyMobileCode(toVerify);
        validationInfos = await userService.getMobileValidationInfos();
        state = validationInfos?.mobileState;
      } else {
        await userService.verifyMFACode(toVerify);
        validationInfos = await userService.getMFAValidationInfos();
        state = validationInfos?.state;
      }
      const codestate =
        state?.state === 'valid'
          ? CodeState.CODE_CORRECT
          : state?.ttl === 0 || state?.tries === 0
          ? CodeState.CODE_EXPIRED
          : CodeState.CODE_WRONG;
      setCodeState(codestate);
      startAnimation(codestate);
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

  const resetCode = useCallback(() => {
    setCode('');
    codeFieldRef?.current?.focus();
    setIsCodeStateHidden(true);
  }, [codeFieldRef]);

  const resendVerificationCode = async () => {
    try {
      setIsResendingVerificationCode(true);
      if (isEmailMFA) {
        await userService.sendEmailVerificationCode(email);
      } else if (isMobileMFA) {
        await userService.sendMobileVerificationCode(mobile);
      } else await userService.getMFAValidationInfos();
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
      Toast.show(texts.resendToast, { ...UI_ANIMATIONS.toast });
      if (codeState === CodeState.CODE_EXPIRED) startAnimation(CodeState.CODE_RESENT);
    }
  };

  const redirectMFA = () => {
    if (isCodeCorrect) {
      const routeNames = {
        [ModificationType.EMAIL]: 'UserEmail',
        [ModificationType.PASSWORD]: 'ChangePassword',
      };
      const params = modificationType === ModificationType.EMAIL ? { navBarTitle, isModifyingEmail: true } : { navBarTitle };
      navigation.dispatch(StackActions.replace({ routeName: routeNames[modificationType], params }));
    }
  };

  const redirectEmailOrMobileMFA = useCallback(() => {
    if (isModifyingEmail) {
      navigation.navigate('Profile');
      onUpdateProfile({ email });
      setTimeout(
        () =>
          Toast.showSuccess(I18n.t('user-email-edit-toast'), {
            position: Toast.position.BOTTOM,
            mask: false,
            ...UI_ANIMATIONS.toast,
          }),
        600,
      );
    } else {
      try {
        onLogin(credentials);
      } catch {
        Toast.show(I18n.t('common.error.text'), {
          onHidden: () => resetCode(),
          ...UI_ANIMATIONS.toast,
        });
      }
    }
  }, [credentials, email, isModifyingEmail, navigation, onLogin, onUpdateProfile, resetCode]);

  useEffect(() => setResendTimer(), []);

  useEffect(() => {
    if (!isVerifyingActive) {
      if (isCodeStateUnknown) {
        Toast.show(I18n.t('common.error.text'), {
          onHidden: () => setCode(''),
          ...UI_ANIMATIONS.toast,
        });
      } else if (isCodeCorrect && isEmailOrMobileMFA) {
        setTimeout(() => redirectEmailOrMobileMFA(), 500);
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
    navBarTitle,
    redirectEmailOrMobileMFA,
    isEmailOrMobileMFA,
  ]);

  return (
    <KeyboardPageView
      isFocused={false}
      style={styles.page}
      scrollable
      navigation={navigation}
      navBarWithBack={{ title: navBarTitle }}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.imageContainer}>
            {isEmailOrMobileMFA ? (
              <NamedSVG
                name={`user-${isEmailMFA ? 'email' : 'smartphone'}`}
                width={UI_SIZES.elements.thumbnail}
                height={UI_SIZES.elements.thumbnail}
              />
            ) : (
              <Lottie
                ref={animationRef}
                source={animationSource}
                style={styles.animation}
                loop={false}
                speed={0.5}
                onAnimationFinish={() => redirectMFA()}
              />
            )}
          </View>
          <HeadingSText style={styles.title}>{texts.title}</HeadingSText>
          <SmallText style={styles.contentSent}>{texts.messageSent}</SmallText>
          <SmallText style={styles.content}>{texts.message}</SmallText>
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
                <BodyText style={[styles.codeStateText, { color: codeStateColor }]}>{texts.feedback}</BodyText>
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
    </KeyboardPageView>
  );
};

export default connect((dispatch: ThunkDispatch<any, void, AnyAction>) => ({
  onLogin: (credentials?: { username: string; password: string; rememberMe: boolean }) => {
    dispatch(checkVersionThenLogin(false, credentials));
  },
  onUpdateProfile(updatedProfileValues: IUpdatableProfileValues) {
    dispatch(profileUpdateAction(updatedProfileValues, false, false));
  },
  dispatch,
}))(MFAScreen);
