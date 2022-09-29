/**
 * Send email verification code screen
 */
import I18n from 'i18n-js';
import React from 'react';
import Toast from 'react-native-tiny-toast';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import theme from '~/app/theme';
import { KeyboardPageView } from '~/framework/components/page';
import { SendEmailVerificationCodeScreen } from '~/user/components/SendEmailVerificationCodeScreen';
import { userService } from '~/user/service';

import { logout } from '../actions/login';

// TYPES ==========================================================================================

export interface ISendEmailVerificationCodeScreenEventProps {
  onLogout(): void;
}
export type ISendEmailVerificationCodeScreenProps = ISendEmailVerificationCodeScreenEventProps & NavigationInjectedProps;

// COMPONENT ======================================================================================

const SendEmailVerificationCodeContainer = (props: ISendEmailVerificationCodeScreenProps) => {
  // EVENTS =====================================================================================

  const credentials = props.navigation.getParam('credentials');
  const defaultEmail = props.navigation.getParam('defaultEmail');
  const [isSendingEmailVerificationCode, setIsSendingEmailVerificationCode] = React.useState(false);

  const sendEmailVerificationCode = async (email: string) => {
    try {
      setIsSendingEmailVerificationCode(true);
      await userService.sendEmailVerificationCode(email);
      props.navigation.navigate('VerifyEmailCode', { credentials, email });
    } catch {
      Toast.show(I18n.t('common.error.text'));
    } finally {
      setIsSendingEmailVerificationCode(false);
    }
  };

  const refuseEmailVerification = () => {
    try {
      props.onLogout();
    } catch {
      // console.warn('refuseEmailVerification: could not refuse email verification');
    }
  };

  // HEADER =====================================================================================

  const navBarInfo = {
    title: I18n.t('user.sendEmailVerificationCodeScreen.title'),
  };

  // RENDER =======================================================================================

  return (
    <KeyboardPageView
      style={{ backgroundColor: theme.ui.background.card }}
      scrollable
      navigation={props.navigation}
      navBar={navBarInfo}>
      <SendEmailVerificationCodeScreen
        defaultEmail={defaultEmail}
        sendAction={email => sendEmailVerificationCode(email)}
        isSending={isSendingEmailVerificationCode}
        refuseAction={() => refuseEmailVerification()}
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
        onLogout: () => dispatch<any>(logout()),
      },
      dispatch,
    ),
)(SendEmailVerificationCodeContainer);
