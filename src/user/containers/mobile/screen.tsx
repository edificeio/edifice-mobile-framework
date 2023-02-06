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
import { userService } from '~/user/service';
import { ValidatorBuilder } from '~/utils/form';

import styles from './styles';
import { MobileState, UserMobileScreenProps } from './types';

const UserMobileScreen = (props: UserMobileScreenProps) => {
  const { onLogout, navigation } = props;

  const credentials = navigation.getParam('credentials');
  const isModifyingMobile = navigation.getParam('isModifyingMobile');
  const navBarTitle = navigation.getParam('navBarTitle');

  const [isSendingCode, setIsSendingCode] = useState(false);
  const [mobile, setMobile] = useState('');
  const [mobileState, setMobileState] = useState<MobileState>(MobileState.PRISTINE);

  const isMobileEmpty = isEmpty(mobile);
  const isMobileStatePristine = mobileState === MobileState.PRISTINE;

  const title = isModifyingMobile ? navBarTitle : I18n.t('user-mobile-verify');
  const navBarInfo = { title };

  const texts: Record<string, any> = isModifyingMobile
    ? {
        title: I18n.t('user-mobile-edit-title'),
        message: I18n.t('user-mobile-edit-message'),
        label: I18n.t('user-mobile-edit-label'),
      }
    : {
        title: I18n.t('user-mobile-verify-title'),
        message: I18n.t('user-mobile-verify-message'),
        label: I18n.t('user-mobile-verify-label'),
      };
  texts.button = I18n.t('user-mobile-verify-button');

  const sendMobileVerificationCode = async (toVerify: string) => {
    // Exit if mobile is not valid
    if (!new ValidatorBuilder().withEmail().build<string>().isValid(toVerify)) return MobileState.MOBILE_FORMAT_INVALID;
    try {
      setIsSendingCode(true);
      const mobileValidationInfos = await userService.getMobileValidationInfos();
      // Exit if mobile has already been verified
      if (toVerify === mobileValidationInfos?.mobileState?.valid) {
        setIsSendingCode(false);
        return MobileState.MOBILE_ALREADY_VERIFIED;
      }
      await userService.sendMobileVerificationCode(toVerify);
      navigation.navigate('MFA', { navBarTitle: title, credentials, isModifyingMobile, isMobileMFA: true, mobile: toVerify });
    } catch {
      Toast.show(I18n.t('common.error.text'), {
        ...UI_ANIMATIONS.toast,
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const sendSMS = async () => {
    const sendResponse = await sendMobileVerificationCode(mobile);
    if (sendResponse) setMobileState(sendResponse);
  };

  const changeMobile = (number: string) => {
    if (!isMobileStatePristine) setMobileState(MobileState.PRISTINE);
    setMobile(number);
  };

  const refuseMobileVerification = () => {
    try {
      onLogout();
    } catch {
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  const displayConfirmationAlert = () => {
    if (isMobileEmpty) {
      navigation.goBack();
    } else {
      Alert.alert(I18n.t('user-mobile-edit-alert-title'), I18n.t('user-mobile-edit-alert-message'), [
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
      {...(isModifyingMobile
        ? {
            navBarWithBack: navBarInfo,
          }
        : {
            navBar: navBarInfo,
          })}
      onBack={() => displayConfirmationAlert()}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <NamedSVG name="user-smartphone" width={UI_SIZES.elements.thumbnail} height={UI_SIZES.elements.thumbnail} />
        </View>
        <HeadingSText style={styles.title}>{texts.title}</HeadingSText>
        <SmallText style={styles.content}>{texts.message}</SmallText>
        <View style={styles.inputTitleContainer}>
          <Picture
            type="NamedSvg"
            name="pictos-smartphone"
            fill={theme.palette.grey.black}
            width={UI_SIZES.dimensions.width.mediumPlus}
            height={UI_SIZES.dimensions.height.mediumPlus}
          />
          <SmallBoldText style={styles.inputTitle}>{texts.label}</SmallBoldText>
        </View>
        <TextInput
          keyboardType="phone-pad"
          placeholder={I18n.t('user-mobile-placeholder')}
          placeholderTextColor={theme.palette.grey.black}
          style={[
            styles.input,
            { borderColor: isMobileStatePristine ? theme.palette.grey.stone : theme.palette.status.failure.regular },
          ]}
          value={mobile}
          onChangeText={text => changeMobile(text)}
        />
        <CaptionItalicText style={styles.errorText}>
          {isMobileStatePristine
            ? I18n.t('common.space')
            : mobileState === MobileState.MOBILE_ALREADY_VERIFIED
            ? I18n.t('user-mobile-error-same')
            : I18n.t('user-mobile-error-invalid')}
        </CaptionItalicText>
        <ActionButton
          style={styles.sendButton}
          text={texts.button}
          disabled={isMobileEmpty}
          loading={isSendingCode}
          action={() => sendSMS()}
        />
        {isModifyingMobile ? null : (
          <TouchableOpacity style={styles.logoutButton} onPress={() => refuseMobileVerification()}>
            <SmallBoldText style={styles.logoutText}>{I18n.t('user-mobile-verify-disconnect')}</SmallBoldText>
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
)(UserMobileScreen);
