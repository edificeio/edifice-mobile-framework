/**
 * Verify email code component
 */
import I18n from 'i18n-js';
import * as React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import Toast from 'react-native-tiny-toast';

import theme from '~/app/theme';
import { UI_ANIMATIONS, UI_SIZES, getScaleDimension } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { BodyBoldText, BodyText, HeadingLText, HeadingSText, SmallText } from '~/framework/components/text';

import { CodeState, ResendResponse } from '../containers/VerifyEmailCodeScreen';

const imageWidth = getScaleDimension(150, 'width');
const imageHeight = getScaleDimension(150, 'height');
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: UI_SIZES.spacing.big },
  contentContainer: { flex: 1 },
  imageContainer: { paddingTop: UI_SIZES.spacing.medium },
  imageSubContainer: { height: imageHeight, alignItems: 'center' },
  title: { textAlign: 'center', marginTop: UI_SIZES.spacing.medium },
  contentEmail: { textAlign: 'center', marginTop: UI_SIZES.spacing.medium },
  content: { textAlign: 'center' },
  codeFieldContainer: { marginTop: UI_SIZES.spacing.large },
  codeFieldCell: {
    width: 45,
    height: 58,
    lineHeight: 58,
    textAlign: 'center',
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.dimensions.width.tiny,
  },
  codeFieldWrapper: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  feedbackContainer: { alignItems: 'center', marginTop: UI_SIZES.spacing.medium },
  codeStateIconContainer: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeStateText: { textAlign: 'center', marginTop: UI_SIZES.spacing.small },
  resendContainer: { justifyContent: 'flex-end' },
  issueText: { textAlign: 'center' },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: UI_SIZES.spacing.small,
  },
  resendText: { marginLeft: UI_SIZES.spacing.minor },
});

export const VerifyEmailCodeScreen = ({
  email,
  codeState,
  verifyAction,
  isVerifying,
  resendAction,
  isResending,
  redirectUserAction,
}: {
  email: string;
  codeState: CodeState;
  verifyAction: (code: string) => void;
  isVerifying: boolean;
  resendAction: () => Promise<ResendResponse>;
  isResending: boolean;
  redirectUserAction: () => void;
}) => {
  const [code, setCode] = React.useState('');
  const [isCodeStateHidden, setIsCodeStateHidden] = React.useState(true);
  const [isResendDisabled, setIsResendDisabled] = React.useState(true);
  const [isVerifyingEnabled, setIsVerifyingEnabled] = React.useState(false);

  const CELL_COUNT = 6;
  const isCodeComplete = code.length === CELL_COUNT;
  const codeFieldRef = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: setCode,
  });

  const isCodeCorrect = codeState === CodeState.CODE_CORRECT;
  const isCodeStateUnknown = codeState === CodeState.CODE_STATE_UNKNOWN;
  const codeStateType = isCodeCorrect ? 'success' : 'failure';
  const codeStateColor = theme.palette.status[codeStateType];
  const isVerifyingActive = isVerifyingEnabled || isVerifying;
  const isResendInactive = isResendDisabled || isResending || isVerifyingActive || isCodeCorrect;
  const isCodeStateDisplayed = !(isCodeStateHidden || isVerifyingActive || isCodeStateUnknown);

  const setVerifyTimer = () => {
    setIsVerifyingEnabled(true);
    const verifyTimer = setTimeout(() => {
      setIsVerifyingEnabled(false);
    }, 500);
    return () => clearTimeout(verifyTimer);
  };
  const setResendTimer = () => {
    setIsResendDisabled(true);
    const resendTimer = setTimeout(() => {
      setIsResendDisabled(false);
    }, 15000);
    return () => clearTimeout(resendTimer);
  };

  const verifyCode = () => {
    if (isCodeComplete) {
      setVerifyTimer();
      verifyAction(code);
      setIsCodeStateHidden(false);
    }
  };
  const resetCode = () => {
    setCode('');
    codeFieldRef?.current?.focus();
    setIsCodeStateHidden(true);
  };
  const resendCode = async () => {
    setResendTimer();
    const resendResponse = await resendAction();
    if (resendResponse === ResendResponse.FAIL) {
      Toast.show(I18n.t('common.error.text'), {
        onHidden: () => setIsResendDisabled(false),
        ...UI_ANIMATIONS.toast,
      });
    } else if (resendResponse === ResendResponse.SUCCESS) {
      Toast.show(I18n.t('user.verifyEmailCodeScreen.codeResent'), {
        ...UI_ANIMATIONS.toast,
      });
    }
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
        const redirectUserTimer = setTimeout(() => {
          redirectUserAction();
        }, 500);
        return () => clearTimeout(redirectUserTimer);
      }
    }
  }, [isVerifyingActive, isCodeStateUnknown, isCodeCorrect, redirectUserAction]);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <View style={styles.imageSubContainer}>
            <NamedSVG name="empty-email" width={imageWidth} height={imageHeight} />
          </View>
        </View>
        <HeadingSText style={styles.title}>{I18n.t('user.verifyEmailCodeScreen.typeCode')}</HeadingSText>
        <SmallText style={styles.contentEmail}>{I18n.t('user.verifyEmailCodeScreen.sentTo') + ` ${email}.`}</SmallText>
        <SmallText style={styles.content}>{I18n.t('user.verifyEmailCodeScreen.mailArrival')}</SmallText>
        <View style={styles.codeFieldContainer}>
          <CodeField
            {...props}
            ref={codeFieldRef}
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
            onBlur={() => verifyCode()}
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
              <View style={[styles.codeStateIconContainer, { borderColor: codeStateColor }]}>
                <Icon size={16} name={isCodeCorrect ? 'checked' : 'close'} color={codeStateColor} />
              </View>
              <BodyText style={[styles.codeStateText, { color: codeStateColor }]}>
                {I18n.t(`user.verifyEmailCodeScreen.${codeState}`)}
              </BodyText>
            </>
          ) : null}
        </View>
      </View>
      <View style={styles.resendContainer}>
        <SmallText style={styles.issueText}>{I18n.t('user.verifyEmailCodeScreen.codeIssue')}</SmallText>
        <TouchableOpacity
          style={[styles.resendButton, { opacity: isResendInactive ? 0.5 : 1 }]}
          disabled={isResendInactive}
          onPress={() => resendCode()}>
          <Icon name="refresh" size={22} color={theme.palette.grey.black} />
          <BodyBoldText style={styles.resendText}>{I18n.t('user.verifyEmailCodeScreen.resendCode')}</BodyBoldText>
        </TouchableOpacity>
      </View>
    </View>
  );
};
