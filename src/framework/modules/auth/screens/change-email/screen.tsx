import { RouteProp, UNSTABLE_usePreventRemove, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Alert, TextInput, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';
import { KeyboardPageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { CaptionItalicText, HeadingSText, SmallBoldText, SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { logoutAction } from '~/framework/modules/auth/actions';
import { IAuthNavigationParams, authRouteNames, getAuthNavigationState } from '~/framework/modules/auth/navigation';
import { getEmailValidationInfos, requestEmailVerificationCode } from '~/framework/modules/auth/service';
import { ModificationType } from '~/framework/modules/user/screens/home/types';
import { clearConfirmNavigationEvent, handleRemoveConfirmNavigationEvent } from '~/framework/navigation/helper';
import { navBarOptions } from '~/framework/navigation/navBar';
import { isEmpty } from '~/framework/util/object';
import { tryAction } from '~/framework/util/redux/actions';
import { ValidatorBuilder } from '~/utils/form';

import styles from './styles';
import { AuthChangeEmailScreenDispatchProps, AuthChangeEmailScreenPrivateProps, EmailState, PageTexts } from './types';

const getNavBarTitle = (route: RouteProp<IAuthNavigationParams, typeof authRouteNames.changeEmail>) =>
  route.params.navBarTitle || I18n.get('auth-change-email-verify');

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.changeEmail>): NativeStackNavigationOptions => {
  return {
    ...navBarOptions({
      navigation,
      route,
      title: getNavBarTitle(route),
    }),
  };
};

const AuthChangeEmailScreen = (props: AuthChangeEmailScreenPrivateProps) => {
  const { tryLogout, navigation, route } = props;
  const isScreenFocused = useIsFocused();

  const platform = route.params.platform;
  const rememberMe = route.params.rememberMe;
  const defaultEmail = route.params.defaultEmail;
  const modificationType = route.params.modificationType;
  const isModifyingEmail = modificationType === ModificationType.EMAIL;
  const texts: PageTexts = isModifyingEmail
    ? {
        button: I18n.get('auth-change-email-verify-button'),
        label: I18n.get('auth-change-email-edit-label'),
        message: I18n.get('auth-change-email-edit-message'),
        title: I18n.get('auth-change-email-edit-title'),
      }
    : {
        button: I18n.get('auth-change-email-verify-button'),
        label: I18n.get('auth-change-email-verify-label'),
        message: I18n.get('auth-change-email-verify-message'),
        title: I18n.get('auth-change-email-verify-title'),
      };

  const [isSendingCode, setIsSendingCode] = useState(false);
  const [email, setEmail] = useState(defaultEmail || '');
  const [emailState, setEmailState] = useState<EmailState>(EmailState.PRISTINE);
  const isEmailEmpty = isEmpty(email);
  const isEmailStatePristine = emailState === EmailState.PRISTINE;

  const doRequestEmailVerificationCode = useCallback(
    async (toVerify: string) => {
      // Exit if email is not valid
      if (!new ValidatorBuilder().withEmail().build<string>().isValid(toVerify)) return EmailState.EMAIL_FORMAT_INVALID;
      try {
        setIsSendingCode(true);
        if (isModifyingEmail) {
          // We don't want to check this on mail validation scenario at login
          // Exit if email has already been verified
          const emailValidationInfos = await getEmailValidationInfos();
          if (toVerify === emailValidationInfos?.emailState?.valid) {
            setIsSendingCode(false);
            return EmailState.EMAIL_ALREADY_VERIFIED;
          }
        }
        await requestEmailVerificationCode(platform, toVerify);
        navigation.navigate(authRouteNames.mfa, {
          platform,
          rememberMe,
          modificationType,
          isEmailMFA: true,
          email: toVerify,
          navBarTitle: getNavBarTitle(route),
        });
      } catch {
        Toast.showError(I18n.get('auth-change-email-error-text'));
      } finally {
        setIsSendingCode(false);
      }
    },
    [isModifyingEmail, modificationType, navigation, platform, rememberMe, route],
  );

  const sendEmail = useCallback(async () => {
    const sendResponse = await doRequestEmailVerificationCode(email);
    if (sendResponse) setEmailState(sendResponse);
  }, [doRequestEmailVerificationCode, email]);

  const changeEmail = useCallback(
    (text: string) => {
      if (!isEmailStatePristine) setEmailState(EmailState.PRISTINE);
      setEmail(text);
    },
    [isEmailStatePristine],
  );

  const refuseEmailVerification = useCallback(async () => {
    try {
      await tryLogout();
      navigation.reset(getAuthNavigationState(platform));
    } catch {
      Toast.showError(I18n.get('auth-change-email-error-text'));
    }
  }, [navigation, platform, tryLogout]);

  UNSTABLE_usePreventRemove(!isEmailEmpty && isScreenFocused, ({ data }) => {
    Alert.alert(I18n.get('auth-change-email-edit-alert-title'), I18n.get('auth-change-email-edit-alert-message'), [
      {
        text: I18n.get('auth-change-email-discard'),
        onPress: () => {
          handleRemoveConfirmNavigationEvent(data.action, props.navigation);
        },
        style: 'destructive',
      },
      {
        text: I18n.get('common-continue'),
        style: 'cancel',
        onPress: () => {
          clearConfirmNavigationEvent();
        },
      },
    ]);
  });

  const onChangeEmail = useCallback((text: string) => changeEmail(text), [changeEmail]);
  const onSendEmail = useCallback(() => sendEmail(), [sendEmail]);
  const onRefuseEmailVerification = useCallback(() => refuseEmailVerification(), [refuseEmailVerification]);

  return (
    <KeyboardPageView style={styles.page} scrollable>
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
            placeholder={I18n.get('auth-change-email-placeholder')}
            placeholderTextColor={theme.palette.grey.graphite}
            style={styles.input}
            value={email}
            onChangeText={onChangeEmail}
          />
        </View>
        <CaptionItalicText style={styles.errorText}>
          {isEmailStatePristine
            ? I18n.get('common-space')
            : emailState === EmailState.EMAIL_ALREADY_VERIFIED
            ? I18n.get('auth-change-email-error-same')
            : I18n.get('auth-change-email-error-invalid')}
        </CaptionItalicText>
        <ActionButton
          style={styles.sendButton}
          text={texts.button}
          disabled={isEmailEmpty}
          loading={isSendingCode}
          action={onSendEmail}
        />
        {isModifyingEmail ? null : (
          <TouchableOpacity style={styles.logoutButton} onPress={onRefuseEmailVerification}>
            <SmallBoldText style={styles.logoutText}>{I18n.get('auth-change-email-verify-disconnect')}</SmallBoldText>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardPageView>
  );
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>) => AuthChangeEmailScreenDispatchProps = dispatch => {
  return bindActionCreators(
    {
      tryLogout: tryAction(logoutAction),
    },
    dispatch,
  );
};

export default connect(undefined, mapDispatchToProps)(AuthChangeEmailScreen);
