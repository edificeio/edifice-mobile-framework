import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView as RNScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import LottieView from 'lottie-react-native';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';

import theme from '~/app/theme';
import { UI_SIZES, UI_VALUES } from '~/framework/components/constants';
import { KeyboardAvoidingView } from '~/framework/components/keyboard';
import { Picture, Svg } from '~/framework/components/picture';
import ScrollView from '~/framework/components/scrollView';
import { BodyBoldText, BodyText, HeadingLText, HeadingSText, SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { I18n } from '~/util/i18n';

import styles from './styles';
import { CodeState, MFAScreenTemplateProps, PageTexts } from './types';

const animationSources = {
  [CodeState.CODE_CORRECT]: require('ASSETS/animations/mfa/code-correct.json'),
  [CodeState.CODE_EXPIRED]: require('ASSETS/animations/mfa/code-wrong-locked.json'),
  [CodeState.CODE_WRONG]: require('ASSETS/animations/mfa/code-wrong.json'),
  [CodeState.CODE_RESENT]: require('ASSETS/animations/mfa/code-wrong-unlocked.json'),
};

const CELL_COUNT = 6;
const CODE_RESEND_DELAY = 15000;
const CODE_VALIDATION_DELAY = 500;
const CODE_REDIRECTION_DELAY = 500;

/**
 * The user types the code that was sent to them. The template does not know what the code is for nor what happens next:
 * it only calls the given actions.
 */
export const MFAScreenTemplate = React.memo(function ({
  kind,
  onResendCode,
  onVerified,
  onVerifyCode,
  testIds,
  texts,
}: MFAScreenTemplateProps) {
  const isEmailMFA = kind === 'email';
  const isMobileMFA = kind === 'mobile';
  const isEmailOrMobileMFA = isEmailMFA || isMobileMFA;

  const [isVerifyingEnabled, setIsVerifyingEnabled] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isResendingVerificationCode, setIsResendingVerificationCode] = useState(false);
  const [isCodeStateHidden, setIsCodeStateHidden] = useState(true);
  const [code, setCode] = useState('');
  const [codeState, setCodeState] = useState<CodeState>(CodeState.PRISTINE);
  const [animationSource, setAnimationSource] = useState(animationSources[CodeState.CODE_CORRECT]);
  const animationRef = useRef<LottieView>(null);

  const codeFieldRef = useBlurOnFulfill({ cellCount: CELL_COUNT, value: code });
  const [codeFieldProps, getCellOnLayoutHandler] = useClearByFocusCell({
    setValue: setCode,
    value: code,
  });

  const isCodeComplete = code.length === CELL_COUNT;
  const isCodeCorrect = codeState === CodeState.CODE_CORRECT;
  const isCodeStateUnknown = codeState === CodeState.CODE_STATE_UNKNOWN;
  const isVerifyingActive = isVerifyingEnabled || isVerifyingCode;
  const isResendInactive = isResendDisabled || isResendingVerificationCode || isVerifyingActive || isCodeCorrect;
  const isCodeStateDisplayed = !(isCodeStateHidden || isVerifyingActive || isCodeStateUnknown);

  const codeStateColor = theme.palette.status[isCodeCorrect ? 'success' : 'failure'].regular;
  const resendOpacity = isResendInactive ? UI_VALUES.opacity.half : UI_VALUES.opacity.opaque;

  const feedback = codeState in texts.feedback ? texts.feedback[codeState as keyof PageTexts['feedback']] : '';

  const setResendTimer = () => {
    setIsResendDisabled(true);
    setTimeout(() => {
      setIsResendDisabled(false);
    }, CODE_RESEND_DELAY);
  };

  const setVerifyTimer = () => {
    setIsVerifyingEnabled(true);
    setTimeout(() => {
      setIsVerifyingEnabled(false);
    }, CODE_VALIDATION_DELAY);
  };

  const startAnimation = (state: CodeState) => {
    setAnimationSource(animationSources[state]);
    animationRef.current?.play();
  };

  const verifyCode = useCallback(
    async (toVerify: string) => {
      try {
        setIsVerifyingCode(true);
        const validationState = await onVerifyCode(toVerify);
        const state =
          validationState?.state === 'valid'
            ? CodeState.CODE_CORRECT
            : validationState?.ttl === 0 || validationState?.tries === 0
              ? CodeState.CODE_EXPIRED
              : CodeState.CODE_WRONG;
        const isCodeAlreadyExpired = codeState === CodeState.CODE_EXPIRED && state === CodeState.CODE_EXPIRED;
        if (!isCodeAlreadyExpired) startAnimation(state);
        setCodeState(state);
      } catch {
        setCodeState(CodeState.CODE_STATE_UNKNOWN);
      } finally {
        setIsVerifyingCode(false);
      }
    },
    [codeState, onVerifyCode],
  );

  const verifyTypedCode = useCallback(() => {
    if (isCodeComplete) {
      setVerifyTimer();
      verifyCode(code);
      setIsCodeStateHidden(false);
    }
  }, [code, isCodeComplete, verifyCode]);

  const resetCode = useCallback(() => {
    setCode('');
    // Typing quirk: the instance type of the field lacks `focus`.
    (codeFieldRef?.current as unknown as { focus?: () => void } | null)?.focus?.();
    setIsCodeStateHidden(true);
  }, [codeFieldRef]);

  const requestNewCode = useCallback(async () => {
    try {
      setIsResendingVerificationCode(true);
      await onResendCode();
      return true;
    } catch {
      return false;
    } finally {
      setIsResendingVerificationCode(false);
    }
  }, [onResendCode]);

  const doResendCode = useCallback(async () => {
    setResendTimer();
    const isResent = await requestNewCode();
    if (!isResent) {
      Toast.showError(I18n.get('auth-mfa-error-text'));
    } else {
      Toast.showSuccess(texts.resendToast);
      if (codeState === CodeState.CODE_EXPIRED) startAnimation(CodeState.CODE_RESENT);
    }
  }, [codeState, requestNewCode, texts.resendToast]);

  const redirectEmailOrMobileMFA = useCallback(async () => {
    try {
      await onVerified();
    } catch {
      Toast.showError(I18n.get('auth-mfa-error-text'));
    }
  }, [onVerified]);

  // For kind `mfa` (no delay), the same is done once the success animation ends.
  const onAnimationFinish = useCallback(() => {
    if (isCodeCorrect) redirectEmailOrMobileMFA();
  }, [isCodeCorrect, redirectEmailOrMobileMFA]);

  useEffect(() => setResendTimer(), []);

  useEffect(() => {
    if (!isVerifyingActive) {
      if (isCodeStateUnknown) {
        Toast.showError(I18n.get('auth-mfa-error-text'));
      } else if (isCodeCorrect && isEmailOrMobileMFA) {
        setTimeout(() => redirectEmailOrMobileMFA(), CODE_REDIRECTION_DELAY);
      }
    }
  }, [isCodeCorrect, isCodeStateUnknown, isEmailOrMobileMFA, isVerifyingActive, redirectEmailOrMobileMFA]);

  const onVerifyTypedCode = useCallback(() => verifyTypedCode(), [verifyTypedCode]);
  const onResetCode = useCallback(() => resetCode(), [resetCode]);
  const onResend = useCallback(() => doResendCode(), [doResendCode]);

  const scrollViewRef = React.useRef<RNScrollView>(null);
  React.useEffect(() => {
    const listener = Keyboard.addListener('keyboardDidShow', () => {
      // Typing quirk: the instance type of the framework ScrollView lacks `scrollToEnd`.
      (scrollViewRef.current as unknown as { scrollToEnd?: () => void } | null)?.scrollToEnd?.();
    });
    return () => {
      listener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView>
      <ScrollView ref={scrollViewRef} style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.imageContainer}>
            {isEmailOrMobileMFA ? (
              <Svg
                name={`user-${isEmailMFA ? 'email' : 'smartphone'}`}
                width={UI_SIZES.elements.thumbnail}
                height={UI_SIZES.elements.thumbnail}
              />
            ) : (
              <LottieView
                ref={animationRef}
                source={animationSource}
                style={styles.animation}
                loop={false}
                speed={0.5}
                onAnimationFinish={onAnimationFinish}
              />
            )}
          </View>
          <HeadingSText style={styles.title} testID={testIds.title}>
            {texts.title}
          </HeadingSText>
          <View testID={testIds.subtitle}>
            <SmallText style={styles.contentSent}>{texts.messageSent}</SmallText>
            <SmallText style={styles.content}>{texts.message}</SmallText>
          </View>
          <View pointerEvents="box-none" style={styles.codeFieldContainer} testID={testIds.code}>
            <CodeField
              {...codeFieldProps}
              ref={codeFieldRef}
              caretHidden={code.length > 0}
              cellCount={CELL_COUNT}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={({ index, isFocused, symbol }) => (
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
              onBlur={onVerifyTypedCode}
            />
            {/* Note: the CodeField's "editable" prop is not sufficient to prevent the user from typing, so an invisible absolute View is used instead.*/}
            {isCodeComplete ? (
              <TouchableWithoutFeedback disabled={isVerifyingActive || isCodeCorrect} onPress={onResetCode}>
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
                  type="Svg"
                  name={`pictos-${isCodeCorrect ? 'success-outline' : 'error'}`}
                  fill={codeStateColor}
                  width={33}
                  height={33}
                />
                <BodyText style={[styles.codeStateText, { color: codeStateColor }]} testID={testIds.codeError}>
                  {feedback}
                </BodyText>
              </>
            ) : null}
          </View>
        </View>
        <View style={styles.resendContainer}>
          <SmallText style={styles.issueText} testID={testIds.codeIssues}>
            {I18n.get('auth-mfa-issue')}
          </SmallText>
          <TouchableOpacity
            style={[styles.resendButton, { opacity: resendOpacity }]}
            disabled={isResendInactive}
            onPress={onResend}
            testID={testIds.resend}>
            <Picture
              type="Svg"
              name="pictos-redo"
              fill={theme.palette.grey.black}
              width={UI_SIZES.dimensions.width.medium}
              height={UI_SIZES.dimensions.height.medium}
            />
            <BodyBoldText style={styles.resendText}>{I18n.get('auth-mfa-resend')}</BodyBoldText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});
MFAScreenTemplate.displayName = 'MFAScreenTemplate';
