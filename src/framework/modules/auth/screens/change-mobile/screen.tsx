import { UNSTABLE_usePreventRemove, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Platform, TouchableOpacity, View } from 'react-native';
import PhoneInput, {
  CountryCode,
  getFormattedNumber,
  getRegionCodeAndNationalNumber,
  isMobileNumber,
  isValidNumber,
} from 'react-native-phone-number-input';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen } from '~/framework/components/emptyConnectionScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { KeyboardPageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { CaptionItalicText, HeadingSText, SmallBoldText, SmallText } from '~/framework/components/text';
import { logoutAction } from '~/framework/modules/auth/actions';
import { AuthRouteNames, IAuthNavigationParams } from '~/framework/modules/auth/navigation';
import { getMobileValidationInfos, getUserRequirements, sendMobileVerificationCode } from '~/framework/modules/auth/service';
import { UpdatableProfileValues, profileUpdateAction } from '~/framework/modules/user/actions';
import { ModificationType } from '~/framework/modules/user/screens/home/types';
import { navBarOptions } from '~/framework/navigation/navBar';
import { containsKey, isEmpty } from '~/framework/util/object';
import { tryAction } from '~/framework/util/redux/actions';

import styles from './styles';
import {
  AuthChangeMobileScreenDispatchProps,
  AuthChangeMobileScreenPrivateProps,
  AuthChangeMobileScreenStoreProps,
  MobileState,
} from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<IAuthNavigationParams, AuthRouteNames.changeMobile>): NativeStackNavigationOptions => {
  return {
    ...navBarOptions({
      navigation,
      route,
    }),
    title: undefined,
  };
};

const countryListLanguages = {
  fr: 'fra',
  en: 'common', // this is english
  es: 'spa',
  DEFAULT: 'common',
} as const;

const AuthChangeMobileScreen = (props: AuthChangeMobileScreenPrivateProps) => {
  const { onLogout, navigation, route } = props;
  const isScreenFocused = useIsFocused();
  const phoneInputRef = useRef<PhoneInput>(null);

  const platform = route.params.platform;
  const rememberMe = route.params.rememberMe;
  const defaultMobile = route.params.defaultMobile;
  const navBarTitle = route.params.navBarTitle;
  const modificationType = route.params.modificationType;
  const isModifyingMobile = modificationType === ModificationType.MOBILE;
  const title = navBarTitle || I18n.t('auth-change-mobile-verify');
  const texts: Record<string, any> = isModifyingMobile
    ? {
        title: I18n.t('auth-change-mobile-edit-title'),
        label: I18n.t('auth-change-mobile-edit-label'),
      }
    : {
        title: I18n.t('auth-change-mobile-verify-title'),
        label: I18n.t('auth-change-mobile-verify-label'),
      };

  const [isSendingCode, setIsSendingCode] = useState(false);
  const [mobile, setMobile] = useState<string>('');
  const [region, setRegion] = useState<CountryCode>('FR');
  const [mobileState, setMobileState] = useState<MobileState>(MobileState.PRISTINE);
  const isMobileEmpty = isEmpty(mobile);
  const isMobileStatePristine = mobileState === MobileState.PRISTINE;

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
        const requirements = await getUserRequirements(platform);
        setIsCheckMobile(containsKey(requirements as object, 'needRevalidateMobile'));
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }
    if (!requirementsChecked) checkRequirements();
  }, [platform, requirementsChecked]);
  texts.button = isCheckMobile ? I18n.t('auth-change-mobile-verify-button') : I18n.t('auth-change-mobile-edit-button');
  texts.message = isModifyingMobile
    ? isCheckMobile
      ? I18n.t('auth-change-mobile-edit-message')
      : I18n.t('auth-change-mobile-edit-message-unverified')
    : I18n.t('auth-change-mobile-verify-message');

  useEffect(() => {
    if (defaultMobile) {
      const regionCodeAndNationalNumber = getRegionCodeAndNationalNumber(defaultMobile);
      if (regionCodeAndNationalNumber) {
        const regionCode = regionCodeAndNationalNumber.regionCode;
        const nationalNumber = regionCodeAndNationalNumber.nationalNumber;
        if (regionCode) setRegion(regionCode);
        if (nationalNumber) setMobile(nationalNumber);
      } else setMobile(defaultMobile);
    }
  }, [defaultMobile]);
  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

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

  const doSendMobileVerificationCode = async (toVerify: string) => {
    try {
      // First, we clean the number by trimming - and . characters (generally used as separators)
      const phoneNumberCleaned = toVerify.replaceAll(/[-.]+/g, '');
      const isValidMobileNumberForRegion = getIsValidMobileNumberForRegion(phoneNumberCleaned);
      const mobileNumberFormatted = getFormattedNumber(phoneNumberCleaned, region);
      // Exit if mobile is not valid
      if (!isValidMobileNumberForRegion || !mobileNumberFormatted) return MobileState.MOBILE_FORMAT_INVALID;
      if (isCheckMobile) {
        setIsSendingCode(true);
        const mobileValidationInfos = await getMobileValidationInfos();
        // Exit if mobile has already been verified
        if (mobileNumberFormatted === mobileValidationInfos?.mobileState?.valid) {
          setIsSendingCode(false);
          return MobileState.MOBILE_ALREADY_VERIFIED;
        }
        await sendMobileVerificationCode(platform, mobileNumberFormatted);
        navigation.navigate(AuthRouteNames.mfa, {
          platform,
          rememberMe,
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
            Toast.showSuccess(I18n.t('auth-change-mobile-edit-toast'), {
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
    const sendResponse = await doSendMobileVerificationCode(mobile);
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

  UNSTABLE_usePreventRemove(!isMobileEmpty && isScreenFocused, ({ data }) => {
    Alert.alert(I18n.t('auth-change-mobile-edit-alert-title'), I18n.t('auth-change-mobile-edit-alert-message'), [
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
    <KeyboardPageView style={styles.page} scrollable>
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
            placeholder={I18n.t('auth-change-mobile-placeholder')}
            ref={phoneInputRef}
            value={mobile}
            defaultCode={region}
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
                placeholder: I18n.t('auth-change-mobile-country-placeholder'),
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
              ? I18n.t('auth-change-mobile-error-same')
              : I18n.t('auth-change-mobile-error-invalid')}
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
              <SmallBoldText style={styles.logoutText}>{I18n.t('auth-change-mobile-verify-disconnect')}</SmallBoldText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </KeyboardPageView>
  );
};

const mapStateToProps: (state: IGlobalState) => AuthChangeMobileScreenStoreProps = state => {
  return {};
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>) => AuthChangeMobileScreenDispatchProps = dispatch => {
  return bindActionCreators(
    {
      onLogout: tryAction(logoutAction, undefined) as unknown as AuthChangeMobileScreenDispatchProps['onLogout'],
      onSaveNewMobile(updatedProfileValues: UpdatableProfileValues) {
        dispatch(profileUpdateAction(updatedProfileValues));
      },
    },
    dispatch,
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(AuthChangeMobileScreen);
