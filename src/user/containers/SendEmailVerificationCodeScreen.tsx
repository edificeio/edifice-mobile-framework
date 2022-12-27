import I18n from 'i18n-js';
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import theme from '~/app/theme';
import { UI_ANIMATIONS } from '~/framework/components/constants';
import { LoadingIndicator } from '~/framework/components/loading';
import { KeyboardPageView } from '~/framework/components/page';
import { containsKey } from '~/framework/util/object';
import { logout } from '~/user/actions/login';
import { IUpdatableProfileValues, profileUpdateAction } from '~/user/actions/profile';
import { EmailState, SendEmailVerificationCodeScreen } from '~/user/components/SendEmailVerificationCodeScreen';
import { userService } from '~/user/service';
import { ValidatorBuilder } from '~/utils/form';

export interface ISendEmailVerificationCodeScreenEventProps {
  onLogout(): void;
  onSaveNewEmail: (updatedProfileValues: IUpdatableProfileValues) => void;
}
export type ISendEmailVerificationCodeScreenProps = ISendEmailVerificationCodeScreenEventProps & NavigationInjectedProps;

const SendEmailVerificationCodeContainer = (props: ISendEmailVerificationCodeScreenProps) => {
  const credentials = props.navigation.getParam('credentials');
  const defaultEmail = props.navigation.getParam('defaultEmail');
  const isModifyingEmail = props.navigation.getParam('isModifyingEmail');

  const [isCheckEmail, setIsCheckEmail] = React.useState(false);
  const [isEmptyEmail, setIsEmptyEmail] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSendingCode, setIsSendingCode] = React.useState(false);

  // Web 4.7+ compliance :
  //   Email verification APIs are available only if mandatory contains at least needRevalidateEmail field
  useEffect(() => {
    async function getUserAuthContext() {
      const userAuthContext = await userService.getUserAuthContext();
      setIsCheckEmail(containsKey(userAuthContext?.mandatory, 'needRevalidateEmail'));
      setIsLoading(false);
    }
    getUserAuthContext();
  }, [isCheckEmail, isLoading]);

  const sendEmailVerificationCode = async (email: string) => {
    // Exit if email is not valid
    if (!new ValidatorBuilder().withEmail().build<string>().isValid(email)) return EmailState.EMAIL_FORMAT_INVALID;
    // Check email or save email depending on web 4.7+ compliance or not
    try {
      if (isCheckEmail) {
        setIsSendingCode(true);
        const emailValidationInfos = await userService.getEmailValidationInfos();
        const validEmail = emailValidationInfos?.emailState?.valid;
        if (email === validEmail) return EmailState.EMAIL_ALREADY_VERIFIED;
        await userService.sendEmailVerificationCode(email);
        setIsSendingCode(false);
        props.navigation.navigate('VerifyEmailCode', { credentials, email, isModifyingEmail });
      } else {
        props.onSaveNewEmail({ email });
        setIsSendingCode(false);
        props.navigation.goBack();
      }
    } catch {
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  const refuseEmailVerification = () => {
    try {
      props.onLogout();
    } catch {
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  const displayConfirmationAlert = () => {
    if (!isEmptyEmail) {
      Alert.alert(
        I18n.t('user.sendEmailVerificationCodeScreen.alertTitle'),
        I18n.t('user.sendEmailVerificationCodeScreen.alertContent'),
        [
          {
            text: I18n.t('common.discard'),
            onPress: () => props.navigation.goBack(),
            style: 'destructive',
          },
          {
            text: I18n.t('common.continue'),
            style: 'cancel',
          },
        ],
      );
    } else props.navigation.goBack();
  };

  const navBarInfo = {
    title: I18n.t(`user.sendEmailVerificationCodeScreen.title${isModifyingEmail ? 'Modify' : ''}`),
  };

  // Display a loading screen during /auth/context call.
  return isLoading ? (
    <LoadingIndicator />
  ) : (
    <KeyboardPageView
      isFocused={false}
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
        emailEmpty={data => setIsEmptyEmail(data)}
        isCheckEmail={isCheckEmail}
        isModifyingEmail={isModifyingEmail}
        isSending={isSendingCode}
        refuseAction={() => refuseEmailVerification()}
        sendAction={email => sendEmailVerificationCode(email)}
      />
    </KeyboardPageView>
  );
};

export default connect(
  () => ({}),
  (dispatch: ThunkDispatch<any, void, AnyAction>) => ({
    onLogout: () => dispatch(logout()),
    onSaveNewEmail(updatedProfileValues: IUpdatableProfileValues) {
      dispatch(profileUpdateAction(updatedProfileValues));
    },
    dispatch,
  }),
)(SendEmailVerificationCodeContainer);
