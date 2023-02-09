import I18n from 'i18n-js';
import React, { useState } from 'react';
import { Alert, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { KeyboardPageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { CaptionItalicText, HeadingSText, SmallBoldText, SmallText } from '~/framework/components/text';
import { isEmpty } from '~/framework/util/object';
import { logout } from '~/user/actions/login';
import { ModificationType } from '~/user/containers/user-account/types';
import { userService } from '~/user/service';
import { ValidatorBuilder } from '~/utils/form';

import styles from './styles';
import { EmailState, UserEmailScreenProps } from './types';

const UserEmailScreen = (props: UserEmailScreenProps) => {
  const { onLogout, navigation } = props;

  const credentials = navigation.getParam('credentials');
  const defaultEmail = navigation.getParam('defaultEmail');
  const navBarTitle = navigation.getParam('navBarTitle');
  const modificationType = navigation.getParam('modificationType');
  const isModifyingEmail = modificationType === ModificationType.EMAIL;

  const [isSendingCode, setIsSendingCode] = useState(false);
  const [email, setEmail] = useState(defaultEmail || '');
  const [emailState, setEmailState] = useState<EmailState>(EmailState.PRISTINE);

  const isEmailEmpty = isEmpty(email);
  const isEmailStatePristine = emailState === EmailState.PRISTINE;

  const title = isModifyingEmail ? navBarTitle : I18n.t('user-email-verify');
  const navBarInfo = { title };

  const texts: Record<string, any> = isModifyingEmail
    ? {
        title: I18n.t('user-email-edit-title'),
        message: I18n.t('user-email-edit-message'),
        label: I18n.t('user-email-edit-label'),
      }
    : {
        title: I18n.t('user-email-verify-title'),
        message: I18n.t('user-email-verify-message'),
        label: I18n.t('user-email-verify-label'),
      };
  texts.button = I18n.t('user-email-verify-button');

  const sendEmailVerificationCode = async (toVerify: string) => {
    // Exit if email is not valid
    if (!new ValidatorBuilder().withEmail().build<string>().isValid(toVerify)) return EmailState.EMAIL_FORMAT_INVALID;
    try {
      setIsSendingCode(true);
      const emailValidationInfos = await userService.getEmailValidationInfos();
      // Exit if email has already been verified
      if (toVerify === emailValidationInfos?.emailState?.valid) {
        setIsSendingCode(false);
        return EmailState.EMAIL_ALREADY_VERIFIED;
      }
      await userService.sendEmailVerificationCode(toVerify);
      navigation.navigate('MFA', { credentials, modificationType, isEmailMFA: true, email: toVerify, navBarTitle: title });
    } catch {
      Toast.show(I18n.t('common.error.text'), {
        ...UI_ANIMATIONS.toast,
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const sendEmail = async () => {
    const sendResponse = await sendEmailVerificationCode(email);
    if (sendResponse) setEmailState(sendResponse);
  };

  const changeEmail = (text: string) => {
    if (!isEmailStatePristine) setEmailState(EmailState.PRISTINE);
    setEmail(text);
  };

  const refuseEmailVerification = () => {
    try {
      onLogout();
    } catch {
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  const displayConfirmationAlert = () => {
    if (isEmailEmpty) {
      navigation.goBack();
    } else {
      Alert.alert(I18n.t('user-email-edit-alert-title'), I18n.t('user-email-edit-alert-message'), [
        {
          text: I18n.t('common.discard'),
          onPress: () => navigation.goBack(),
          style: 'destructive',
        },
        {
          text: I18n.t('common.continue'),
          style: 'cancel',
        },
      ]);
    }
  };

  return (
    <KeyboardPageView
      isFocused={false}
      style={styles.page}
      scrollable
      navigation={navigation}
      {...(isModifyingEmail
        ? {
            navBarWithBack: navBarInfo,
          }
        : {
            navBar: navBarInfo,
          })}
      onBack={() => displayConfirmationAlert()}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <NamedSVG name="user-email" width={UI_SIZES.elements.thumbnail} height={UI_SIZES.elements.thumbnail} />
        </View>
        <HeadingSText style={styles.title}>{texts.title}</HeadingSText>
        <SmallText style={styles.content}>{texts.message}</SmallText>
        <View style={styles.inputTitleContainer}>
          <Picture
            type="NamedSvg"
            name="pictos-mail"
            fill={theme.palette.grey.black}
            width={UI_SIZES.dimensions.width.mediumPlus}
            height={UI_SIZES.dimensions.height.mediumPlus}
          />
          <SmallBoldText style={styles.inputTitle}>{texts.label}</SmallBoldText>
        </View>
        <TextInput
          autoCorrect={false}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder={I18n.t('user-email-placeholder')}
          placeholderTextColor={theme.palette.grey.graphite}
          style={[
            styles.input,
            { borderColor: isEmailStatePristine ? theme.palette.grey.stone : theme.palette.status.failure.regular },
          ]}
          value={email}
          onChangeText={text => changeEmail(text)}
        />
        <CaptionItalicText style={styles.errorText}>
          {isEmailStatePristine
            ? I18n.t('common.space')
            : emailState === EmailState.EMAIL_ALREADY_VERIFIED
            ? I18n.t('user-email-error-same')
            : I18n.t('user-email-error-invalid')}
        </CaptionItalicText>
        <ActionButton
          style={styles.sendButton}
          text={texts.button}
          disabled={isEmailEmpty}
          loading={isSendingCode}
          action={() => sendEmail()}
        />
        {isModifyingEmail ? null : (
          <TouchableOpacity style={styles.logoutButton} onPress={() => refuseEmailVerification()}>
            <SmallBoldText style={styles.logoutText}>{I18n.t('user-email-verify-disconnect')}</SmallBoldText>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardPageView>
  );
};

export default connect(
  () => ({}),
  (dispatch: ThunkDispatch<any, void, AnyAction>) => ({
    onLogout: () => dispatch(logout()),
    dispatch,
  }),
)(UserEmailScreen);
