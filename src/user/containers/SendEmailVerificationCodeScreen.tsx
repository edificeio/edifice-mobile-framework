/**
 * Send email verification code screen
 */
import I18n from 'i18n-js';
import React from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import theme from '~/app/theme';
import { UI_ANIMATIONS } from '~/framework/components/constants';
import { KeyboardPageView } from '~/framework/components/page';
import { userService } from '~/user/service';
import { ValidatorBuilder } from '~/utils/form';

import { logout } from '../actions/login';
import { EmailState, SendEmailVerificationCodeScreen } from '../components/SendEmailVerificationCodeScreen';

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
  const isModifyingEmail = props.navigation.getParam('isModifyingEmail');
  const modifyString = isModifyingEmail ? 'Modify' : '';
  const [isSendingEmailVerificationCode, setIsSendingEmailVerificationCode] = React.useState(false);

  const sendEmailVerificationCode = async (email: string) => {
    const emailValidator = new ValidatorBuilder().withEmail().build<string>();
    const isEmailFormatValid = emailValidator.isValid(email);
    if (!isEmailFormatValid) return EmailState.EMAIL_FORMAT_INVALID;
    else {
      try {
        setIsSendingEmailVerificationCode(true);
        const emailValidationInfos = await userService.getEmailValidationInfos();
        const validEmail = emailValidationInfos?.emailState?.valid;
        if (email === validEmail) return EmailState.EMAIL_ALREADY_VERIFIED;
        await userService.sendEmailVerificationCode(email);
        props.navigation.navigate('VerifyEmailCode', { credentials, email, isModifyingEmail });
      } catch {
        Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
      } finally {
        setIsSendingEmailVerificationCode(false);
      }
    }
  };

  const refuseEmailVerification = () => {
    try {
      props.onLogout();
    } catch {
      // console.warn('refuseEmailVerification: could not refuse email verification');
    }
  };

  const displayConfirmationAlert = () => {
    if (isModifyingEmail) {
      Alert.alert(
        I18n.t('user.sendEmailVerificationCodeScreen.alertTitle'),
        I18n.t('user.sendEmailVerificationCodeScreen.alertContent'),
        [
          {
            text: I18n.t('common.discard'),
            onPress: () => props.navigation.navigate('MyProfile'),
            style: 'destructive',
          },
          {
            text: I18n.t('common.continue'),
            style: 'cancel',
          },
        ],
      );
    }
  };

  // HEADER =====================================================================================

  const navBarInfo = {
    title: I18n.t(`user.sendEmailVerificationCodeScreen.title${modifyString}`),
  };

  // RENDER =======================================================================================

  return (
    <KeyboardPageView
      style={{ backgroundColor: theme.ui.background.card }}
      scrollable
      navigation={props.navigation}
      {...(isModifyingEmail
        ? {
            navBarWithBack: navBarInfo,
          }
        : {
            navBar: navBarInfo,
          })}
      onBack={() => displayConfirmationAlert()}>
      <SendEmailVerificationCodeScreen
        defaultEmail={defaultEmail}
        isModifyingEmail={isModifyingEmail}
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
