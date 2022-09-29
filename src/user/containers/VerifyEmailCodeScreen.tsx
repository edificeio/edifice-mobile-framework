/**
 * Verify email code screen
 */
import I18n from 'i18n-js';
import React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import theme from '~/app/theme';
import { KeyboardPageView } from '~/framework/components/page';
import { userService } from '~/user/service';

import { checkVersionThenLogin } from '../actions/version';
import { VerifyEmailCodeScreen } from '../components/VerifyEmailCodeScreen';

// TYPES ==========================================================================================

export interface IVerifyEmailCodeScreenEventProps {
  onLogin(credentials?: { username: string; password: string; rememberMe: boolean }): void;
}
export type IVerifyEmailCodeScreenProps = IVerifyEmailCodeScreenEventProps & NavigationInjectedProps;

export enum CodeState {
  PRISTINE = 'pristine',
  CODE_WRONG = 'codeWrong',
  CODE_EXPIRED = 'codeExpired',
  CODE_CORRECT = 'codeCorrect',
  CODE_STATE_UNKNOWN = 'codeStateUnknown',
}

export enum ResendResponse {
  SUCCESS = 'success',
  FAIL = 'fail',
}

// COMPONENT ======================================================================================

const VerifyEmailCodeContainer = (props: IVerifyEmailCodeScreenProps) => {
  // EVENTS =====================================================================================

  const credentials = props.navigation.getParam('credentials');
  const email = props.navigation.getParam('email');
  const [isVerifyingEmailCode, setIsVerifyingEmailCode] = React.useState(false);
  const [isResendingEmailVerificationCode, setIsResendingEmailVerificationCode] = React.useState(false);
  const [codeState, setCodeState] = React.useState<CodeState>(CodeState.PRISTINE);

  const verifyEmailCode = async (code: string) => {
    try {
      setIsVerifyingEmailCode(true);
      await userService.verifyEmailCode(code);
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
      setIsVerifyingEmailCode(false);
    }
  };

  const resendEmailVerificationCode = async () => {
    try {
      setIsResendingEmailVerificationCode(true);
      await userService.sendEmailVerificationCode(email);
      return ResendResponse.SUCCESS;
    } catch {
      return ResendResponse.FAIL;
    } finally {
      setIsResendingEmailVerificationCode(false);
    }
  };

  const login = async () => {
    try {
      props.onLogin(credentials);
    } catch {
      // console.warn('login: could not login');
    }
  };

  // HEADER =====================================================================================

  const navBarInfo = {
    title: I18n.t('user.verifyEmailCodeScreen.title'),
  };

  // RENDER =======================================================================================

  return (
    <KeyboardPageView
      style={{ backgroundColor: theme.ui.background.card }}
      scrollable
      navigation={props.navigation}
      navBarWithBack={navBarInfo}>
      <VerifyEmailCodeScreen
        email={email}
        verifyAction={code => verifyEmailCode(code)}
        isVerifying={isVerifyingEmailCode}
        codeState={codeState}
        resendAction={() => resendEmailVerificationCode()}
        isResending={isResendingEmailVerificationCode}
        loginAction={() => login()}
      />
    </KeyboardPageView>
  );
};

// MAPPING ========================================================================================

export default connect(
  () => ({}),
  dispatch =>
    bindActionCreators(
      {
        onLogin: (credentials?: { username: string; password: string; rememberMe: boolean }) => {
          dispatch<any>(checkVersionThenLogin(false, credentials));
        },
      },
      dispatch,
    ),
)(VerifyEmailCodeContainer);
