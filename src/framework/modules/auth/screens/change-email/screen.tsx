import { UNSTABLE_usePreventRemove } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import React, { useState } from 'react';
import { Alert, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { KeyboardPageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { CaptionItalicText, HeadingSText, SmallBoldText, SmallText } from '~/framework/components/text';
import { logoutAction } from '~/framework/modules/auth/actions';
import { AuthRouteNames, IAuthNavigationParams } from '~/framework/modules/auth/navigation';
import { getEmailValidationInfos, sendEmailVerificationCode } from '~/framework/modules/auth/service';
import { ModificationType } from '~/framework/modules/user/screens/home/types';
import { navBarOptions } from '~/framework/navigation/navBar';
import { isEmpty } from '~/framework/util/object';
import { tryAction } from '~/framework/util/redux/actions';
import { ValidatorBuilder } from '~/utils/form';

import styles from './styles';
import {
  AuthChangeEmailScreenDispatchProps,
  AuthChangeEmailScreenPrivateProps,
  AuthChangeEmailScreenStoreProps,
  EmailState,
} from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<IAuthNavigationParams, typeof AuthRouteNames.changeEmail>): NativeStackNavigationOptions => {
  const navBarTitle = route.params.navBarTitle;
  const title = navBarTitle || I18n.t('auth-change-email-verify');
  return {
    ...navBarOptions({
      navigation,
      route,
    }),
    title,
  };
};

const AuthChangeEmailScreen = (props: AuthChangeEmailScreenPrivateProps) => {
  const { onLogout, navigation, route } = props;

  const platform = route.params.platform;
  const rememberMe = route.params.rememberMe;
  const defaultEmail = route.params.defaultEmail;
  const navBarTitle = route.params.navBarTitle;
  const modificationType = route.params.modificationType;
  const isModifyingEmail = modificationType === ModificationType.EMAIL;

  const [isSendingCode, setIsSendingCode] = useState(false);
  const [email, setEmail] = useState(defaultEmail || '');
  const [emailState, setEmailState] = useState<EmailState>(EmailState.PRISTINE);

  const isEmailEmpty = isEmpty(email);
  const isEmailStatePristine = emailState === EmailState.PRISTINE;

  const title = navBarTitle || I18n.t('auth-change-email-verify');

  const texts: Record<string, any> = isModifyingEmail
    ? {
        title: I18n.t('auth-change-email-edit-title'),
        message: I18n.t('auth-change-email-edit-message'),
        label: I18n.t('auth-change-email-edit-label'),
      }
    : {
        title: I18n.t('auth-change-email-verify-title'),
        message: I18n.t('auth-change-email-verify-message'),
        label: I18n.t('auth-change-email-verify-label'),
      };
  texts.button = I18n.t('auth-change-email-verify-button');

  const doSendEmailVerificationCode = async (toVerify: string) => {
    // Exit if email is not valid
    if (!new ValidatorBuilder().withEmail().build<string>().isValid(toVerify)) return EmailState.EMAIL_FORMAT_INVALID;
    try {
      setIsSendingCode(true);
      const emailValidationInfos = await getEmailValidationInfos();
      // Exit if email has already been verified
      if (toVerify === emailValidationInfos?.emailState?.valid) {
        setIsSendingCode(false);
        return EmailState.EMAIL_ALREADY_VERIFIED;
      }
      await sendEmailVerificationCode(platform, toVerify);
      navigation.navigate(AuthRouteNames.mfa, {
        platform,
        rememberMe,
        modificationType,
        isEmailMFA: true,
        email: toVerify,
        navBarTitle: title,
      });
    } catch {
      Toast.show(I18n.t('common.error.text'), {
        ...UI_ANIMATIONS.toast,
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const sendEmail = async () => {
    const sendResponse = await doSendEmailVerificationCode(email);
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

  UNSTABLE_usePreventRemove(!isEmailEmpty, ({ data }) => {
    Alert.alert(I18n.t('auth-change-email-edit-alert-title'), I18n.t('auth-change-email-edit-alert-message'), [
      {
        text: I18n.t('common.discard'),
        onPress: () => props.navigation.dispatch(data.action),
        style: 'destructive',
      },
      {
        text: I18n.t('common.continue'),
        style: 'cancel',
      },
    ]);
  });

  return (
    <KeyboardPageView isFocused={false} style={styles.page} scrollable>
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
        <View
          style={[
            styles.inputWrapper,
            { borderColor: isEmailStatePristine ? theme.palette.grey.stone : theme.palette.status.failure.regular },
          ]}>
          <TextInput
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder={I18n.t('auth-change-email-placeholder')}
            placeholderTextColor={theme.palette.grey.graphite}
            style={styles.input}
            value={email}
            onChangeText={text => changeEmail(text)}
          />
        </View>
        <CaptionItalicText style={styles.errorText}>
          {isEmailStatePristine
            ? I18n.t('common.space')
            : emailState === EmailState.EMAIL_ALREADY_VERIFIED
            ? I18n.t('auth-change-email-error-same')
            : I18n.t('auth-change-email-error-invalid')}
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
            <SmallBoldText style={styles.logoutText}>{I18n.t('auth-change-email-verify-disconnect')}</SmallBoldText>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardPageView>
  );
};

const mapStateToProps: (state: IGlobalState) => AuthChangeEmailScreenStoreProps = state => {
  return {};
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>) => AuthChangeEmailScreenDispatchProps = dispatch => {
  return bindActionCreators(
    {
      onLogout: tryAction(logoutAction, undefined, true) as unknown as AuthChangeEmailScreenDispatchProps['onLogout'],
    },
    dispatch,
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(AuthChangeEmailScreen);
