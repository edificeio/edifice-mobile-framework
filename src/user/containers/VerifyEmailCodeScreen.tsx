/**
 * Verify email code screen
 */
import I18n from 'i18n-js';
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import theme from '~/app/theme';
import { EmptyConnectionScreen } from '~/framework/components/emptyConnectionScreen';
import { KeyboardPageView } from '~/framework/components/page';
import { IUpdatableProfileValues, profileUpdateAction } from '~/user/actions/profile';
import { userService } from '~/user/service';

import { checkVersionThenLogin } from '../actions/version';
import { VerifyEmailCodeScreen } from '../components/VerifyEmailCodeScreen';

// TYPES ==========================================================================================

export interface IVerifyEmailCodeScreenEventProps {
  connected: boolean;
  onLogin(credentials?: { username: string; password: string; rememberMe: boolean }): void;
  onSaveNewEmail: (updatedProfileValues: IUpdatableProfileValues) => void;
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
  const isModifyingEmail = props.navigation.getParam('isModifyingEmail');

  const [isVerifyingEmailCode, setIsVerifyingEmailCode] = React.useState(false);
  const [isResendingEmailVerificationCode, setIsResendingEmailVerificationCode] = React.useState(false);
  const [codeState, setCodeState] = React.useState<CodeState>(CodeState.PRISTINE);
  const hasConnection = props.navigation.getParam('connection') ?? true;

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

  const redirectUser = async () => {
    try {
      if (isModifyingEmail) {
        props.navigation.navigate('Profile');
        props.onSaveNewEmail({ email });
      } else {
        props.onLogin(credentials);
      }
    } catch {
      // console.warn('redirectUser: could not redirect user');
    }
  };

  const displayConfirmationAlert = () => {
    if (isModifyingEmail) {
      Alert.alert(I18n.t('user.verifyEmailCodeScreen.alertTitle'), I18n.t('user.verifyEmailCodeScreen.alertContent'), [
        {
          text: I18n.t('common.discard'),
          onPress: () => props.navigation.navigate('Profile'),
          style: 'destructive',
        },
        {
          text: I18n.t('common.continue'),
          style: 'cancel',
        },
      ]);
    } else return true;
  };

  // HEADER =====================================================================================

  const navBarInfo = {
    title: I18n.t(`user.verifyEmailCodeScreen.title${isModifyingEmail ? 'Modify' : ''}`),
  };

  // RENDER =======================================================================================

  return (
    <KeyboardPageView
      isFocused={false}
      style={{ backgroundColor: theme.ui.background.card }}
      scrollable
      navigation={props.navigation}
      navBarWithBack={navBarInfo}
      onBack={() => displayConfirmationAlert()}>
      {hasConnection ? (
        <VerifyEmailCodeScreen
          email={email}
          verifyAction={code => verifyEmailCode(code)}
          isVerifying={isVerifyingEmailCode}
          codeState={codeState}
          resendAction={() => resendEmailVerificationCode()}
          isResending={isResendingEmailVerificationCode}
          redirectUserAction={() => redirectUser()}
        />
      ) : (
        <EmptyConnectionScreen />
      )}
    </KeyboardPageView>
  );
};

// MAPPING ========================================================================================

export default connect((dispatch: ThunkDispatch<any, void, AnyAction>) => ({
  onLogin: (credentials?: { username: string; password: string; rememberMe: boolean }) => {
    dispatch(checkVersionThenLogin(false, credentials));
  },
  onSaveNewEmail(updatedProfileValues: IUpdatableProfileValues) {
    dispatch(profileUpdateAction(updatedProfileValues));
  },
  dispatch,
}))(VerifyEmailCodeContainer);
