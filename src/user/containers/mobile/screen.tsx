import I18n from 'i18n-js';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Platform, TouchableOpacity, View } from 'react-native';
import PhoneInput, { CountryCode, getFormattedNumber, isMobileNumber, isValidNumber } from 'react-native-phone-number-input';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen } from '~/framework/components/emptyConnectionScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { KeyboardPageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { CaptionItalicText, HeadingSText, SmallBoldText, SmallText } from '~/framework/components/text';
import { containsKey, isEmpty } from '~/framework/util/object';
import { logout } from '~/user/actions/login';
import { IUpdatableProfileValues, profileUpdateAction } from '~/user/actions/profile';
import { ModificationType } from '~/user/containers/user-account/types';
import { userService } from '~/user/service';

import styles from './styles';
import { MobileState, UserMobileScreenProps } from './types';

const countryListLanguages = {
  fr: 'fra',
  en: 'common', // this is english
  es: 'spa',
  DEFAULT: 'common',
} as const;

const UserMobileScreen = (props: UserMobileScreenProps) => {
  const { onLogout, navigation } = props;

  const credentials = navigation.getParam('credentials');
  const navBarTitle = navigation.getParam('navBarTitle');
  const modificationType = navigation.getParam('modificationType');
  const isModifyingMobile = modificationType === ModificationType.MOBILE;

  const phoneInputRef = useRef<PhoneInput>(null);

  const [isSendingCode, setIsSendingCode] = useState(false);
  const [mobile, setMobile] = useState<string>('');
  const [region, setRegion] = useState<CountryCode>('FR');
  const [mobileState, setMobileState] = useState<MobileState>(MobileState.PRISTINE);
  // Web 4.8+ compliance:
  //  -mobile verification APIs are available if /auth/user/requirements contains the needRevalidateMobile field
  //  -requirementsChecked is used to avoid multiple calls to /auth/user/requirements (useEffect can be called multiple times)
  const [requirementsChecked, setRequirementsChecked] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [isCheckMobile, setIsCheckMobile] = React.useState(false);

  useEffect(() => {
    async function checkRequirements() {
      try {
        setRequirementsChecked(true);
        setIsLoading(true);
        const requirements = await userService.getUserRequirements();
        setIsCheckMobile(containsKey(requirements as object, 'needRevalidateMobile'));
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }
    if (!requirementsChecked) checkRequirements();
  }, [requirementsChecked]);

  const isMobileEmpty = isEmpty(mobile);
  const isMobileStatePristine = mobileState === MobileState.PRISTINE;

  const title = isModifyingMobile ? navBarTitle : I18n.t('user-mobile-verify');
  const navBarInfo = { title };

  const texts: Record<string, any> = isModifyingMobile
    ? {
        title: I18n.t('user-mobile-edit-title'),
        label: I18n.t('user-mobile-edit-label'),
      }
    : {
        title: I18n.t('user-mobile-verify-title'),
        label: I18n.t('user-mobile-verify-label'),
      };
  texts.button = isCheckMobile ? I18n.t('user-mobile-verify-button') : I18n.t('user-mobile-edit-button');
  texts.message = isModifyingMobile
    ? isCheckMobile
      ? I18n.t('user-mobile-edit-message')
      : I18n.t('user-mobile-edit-message-unverified')
    : I18n.t('user-mobile-verify-message');

  const getIsValidMobileNumberForRegion = (toVerify: string) => {
    try {
      // Returns whether number is valid for selected region and an actual mobile number
      const isValidNumberForRegion = isValidNumber(toVerify, region);
      const isValidMobileNumber = isMobileNumber(toVerify, region);
      return isValidNumberForRegion && isValidMobileNumber;
    } catch {
      // Returns false in case of format error (string is too short, isn't recognized as a phone number, etc.)
      return false;
    }
  };

  const sendMobileVerificationCode = async (toVerify: string) => {
    try {
      // First, we clean the number by trimming - and . characters (generally used as separators)
      const phoneNumberCleaned = toVerify.replaceAll(/[-.]+/g, '');
      const isValidMobileNumberForRegion = getIsValidMobileNumberForRegion(phoneNumberCleaned);
      const mobileNumberFormatted = getFormattedNumber(phoneNumberCleaned, region);
      // Exit if mobile is not valid
      if (!isValidMobileNumberForRegion || !mobileNumberFormatted) return MobileState.MOBILE_FORMAT_INVALID;
      if (isCheckMobile) {
        setIsSendingCode(true);
        const mobileValidationInfos = await userService.getMobileValidationInfos();
        // Exit if mobile has already been verified
        if (mobileNumberFormatted === mobileValidationInfos?.mobileState?.valid) {
          setIsSendingCode(false);
          return MobileState.MOBILE_ALREADY_VERIFIED;
        }
        await userService.sendMobileVerificationCode(mobileNumberFormatted);
        navigation.navigate('MFA', {
          credentials,
          modificationType,
          isMobileMFA: true,
          mobile: mobileNumberFormatted,
          navBarTitle: title,
        });
      } else {
        setIsSendingCode(false);
        props.onSaveNewMobile({ mobile: mobileNumberFormatted });
        props.navigation.goBack();
        setTimeout(
          () =>
            Toast.showSuccess(I18n.t('user-mobile-edit-toast'), {
              position: Toast.position.BOTTOM,
              mask: false,
              ...UI_ANIMATIONS.toast,
            }),
          100,
        );
      }
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
      {isLoading ? (
        <LoadingIndicator />
      ) : isError ? (
        <EmptyConnectionScreen />
      ) : (
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
          <PhoneInput
            placeholder={I18n.t('user-mobile-placeholder')}
            ref={phoneInputRef}
            value={mobile}
            defaultCode="FR"
            layout="third"
            onChangeFormattedText={text => changeMobile(text)}
            onChangeCountry={code => setRegion(code.cca2)}
            containerStyle={[
              { borderColor: isMobileStatePristine ? theme.palette.grey.cloudy : theme.palette.status.failure.regular },
              styles.input,
            ]}
            flagButtonStyle={styles.flagButton}
            codeTextStyle={styles.flagCode}
            textContainerStyle={[
              styles.inputTextContainer,
              {
                borderColor: isMobileStatePristine ? theme.palette.grey.cloudy : theme.palette.status.failure.regular,
              },
            ]}
            textInputStyle={styles.inputTextInput}
            flagSize={Platform.select({ ios: UI_SIZES.dimensions.width.larger, android: UI_SIZES.dimensions.width.medium })}
            drowDownImage={
              <NamedSVG style={styles.dropDownArrow} name="ui-rafterDown" fill={theme.ui.text.regular} width={12} height={12} />
            }
            countryPickerProps={{
              filterProps: {
                placeholder: I18n.t('user-mobile-country-placeholder'),
                autoFocus: true,
              },
              language: countryListLanguages[I18n.currentLocale()] ?? countryListLanguages.DEFAULT,
            }}
            textInputProps={{
              hitSlop: {
                top: -UI_SIZES.spacing.big,
                bottom: -UI_SIZES.spacing.big,
                left: 0,
                right: 0,
              },
            }}
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
      )}
    </KeyboardPageView>
  );
};

export default connect(
  () => ({}),
  (dispatch: ThunkDispatch<any, void, AnyAction>) => ({
    onLogout: () => dispatch(logout()),
    onSaveNewMobile(updatedProfileValues: IUpdatableProfileValues) {
      dispatch(profileUpdateAction(updatedProfileValues));
    },
    dispatch,
  }),
)(UserMobileScreen);
