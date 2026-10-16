import * as React from 'react';
import { Alert, Keyboard, Platform, View } from 'react-native';

import { useIsFocused } from '@react-navigation/native';
import PhoneInput, {
  Country,
  CountryCode,
  getFormattedNumber,
  getRegionCodeAndNationalNumber,
  isMobileNumber,
  isValidNumber,
} from 'react-native-phone-number-input';

import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import { KeyboardAvoidingView } from '~/framework/components/keyboard';
import { Picture, Svg } from '~/framework/components/picture';
import ScrollView from '~/framework/components/scrollView';
import { CaptionItalicText, HeadingSText, SmallBoldText, SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import usePreventBack from '~/framework/hooks/prevent-back';
import { isEmpty } from '~/framework/util/object';
import { I18n } from '~/util/i18n';

import styles from './styles';
import type { MobileState, PageTexts, RequirementVerifyMobileScreenTemplateProps } from './types';

const countryListLanguages = {
  DEFAULT: 'common',
  en: 'common',
  // this is english
  es: 'spa',

  fr: 'fra',
} as const;

/**
 * The user must verify its mobile number: it gives it (prefilled with the one the platform knows), then asks for a code.
 * The template does not know what happens next: it only calls the given actions.
 */
export const RequirementVerifyMobileScreenTemplate = React.memo(function ({
  defaultMobile,
  onRefuse,
  onSubmit,
}: RequirementVerifyMobileScreenTemplateProps) {
  const isScreenFocused = useIsFocused();
  const phoneInputRef = React.useRef<PhoneInput>(null);

  const [isSendingCode, setIsSendingCode] = React.useState(false);
  const [mobile, setMobile] = React.useState<string>('');
  const [region, setRegion] = React.useState<CountryCode>('FR');
  const [mobileState, setMobileState] = React.useState<MobileState>('PRISTINE');
  const isMobileEmpty = isEmpty(mobile);
  const isMobileStateClean = mobileState === 'STALE' || mobileState === 'PRISTINE';

  const texts: PageTexts = {
    button: I18n.get('auth-change-mobile-verify-button'),
    label: I18n.get('auth-change-mobile-verify-label'),
    message: I18n.get('auth-change-mobile-verify-message'),
    title: I18n.get('auth-change-mobile-verify-title'),
  };

  React.useEffect(() => {
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

  const getIsValidMobileNumberForRegion = React.useCallback(
    (toVerify: string) => {
      try {
        // Returns whether number is valid for selected region and an actual mobile number
        const isValidNumberForRegion = isValidNumber(toVerify, region);
        const isValidMobileNumber = isMobileNumber(toVerify, region);
        return isValidNumberForRegion && isValidMobileNumber;
      } catch {
        // Returns false in case of format error (string is too short, isn't recognized as a phone number, etc.)
        return false;
      }
    },
    [region],
  );

  const doRequestMobileVerificationCode = React.useCallback(
    async (toVerify: string) => {
      try {
        // First, we clean the number by trimming - and . characters (generally used as separators)
        const phoneNumberCleaned = toVerify.replaceAll(/[-.]+/g, '');
        const isValidMobileNumberForRegion = getIsValidMobileNumberForRegion(phoneNumberCleaned);
        const mobileNumberFormatted = getFormattedNumber(phoneNumberCleaned, region);
        // Exit if mobile is not valid
        if (!isValidMobileNumberForRegion || !mobileNumberFormatted) return 'MOBILE_FORMAT_INVALID' as const;
        setIsSendingCode(true);
        await onSubmit(mobileNumberFormatted);
      } catch {
        Toast.showError(I18n.get('auth-change-mobile-error-text'));
      } finally {
        setIsSendingCode(false);
      }
    },
    [getIsValidMobileNumberForRegion, onSubmit, region],
  );

  const sendSMS = React.useCallback(async () => {
    const sendResponse = await doRequestMobileVerificationCode(mobile);
    if (sendResponse) setMobileState(sendResponse);
  }, [doRequestMobileVerificationCode, mobile]);

  const changeMobile = React.useCallback(
    (number: string) => {
      if (mobileState !== 'STALE') setMobileState('STALE');
      setMobile(number);
    },
    [mobileState],
  );

  const refuseMobileVerification = React.useCallback(async () => {
    try {
      await onRefuse();
    } catch {
      Toast.showError(I18n.get('auth-change-mobile-error-text'));
    }
  }, [onRefuse]);

  // In the old screen, leaving was only prevented when the user modified its mobile from its profile (never for the requirement).
  usePreventBack({
    showAlert: false,
    text: I18n.get('auth-change-mobile-edit-alert-message'),
    title: I18n.get('auth-change-mobile-edit-alert-title'),
  });

  const onChangeMobile = React.useCallback((text: string) => changeMobile(text), [changeMobile]);
  const onSetRegion = React.useCallback((code: Country) => setRegion(code.cca2), [setRegion]);
  const onSendSMS = React.useCallback(() => sendSMS(), [sendSMS]);
  const onRefuseMobileVerification = React.useCallback(() => {
    if (!isMobileEmpty && mobileState !== 'PRISTINE' && isScreenFocused) {
      Alert.alert(I18n.get('auth-change-mobile-edit-alert-title'), I18n.get('auth-change-mobile-edit-alert-message'), [
        {
          onPress: () => {
            refuseMobileVerification();
          },
          style: 'destructive',
          text: I18n.get('common-quit'),
        },
        {
          style: 'default',
          text: I18n.get('common-continue'),
        },
      ]);
    } else {
      refuseMobileVerification();
    }
  }, [isMobileEmpty, isScreenFocused, mobileState, refuseMobileVerification]);

  // Typing quirk: the instance type of the framework `ScrollView` lacks `scrollToEnd`, so we type the ref locally and cast it.
  const scrollViewRef = React.useRef<{ scrollToEnd: () => void }>(null);
  React.useEffect(() => {
    const listener = Keyboard.addListener('keyboardDidShow', () => {
      scrollViewRef.current?.scrollToEnd();
    });
    return () => {
      listener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView>
      <ScrollView ref={scrollViewRef as React.Ref<never>} style={styles.page}>
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <Svg name="user-smartphone" width={UI_SIZES.elements.thumbnail} height={UI_SIZES.elements.thumbnail} />
          </View>
          <HeadingSText style={styles.title} testID="phone-new-title">
            {texts.title}
          </HeadingSText>
          <SmallText style={styles.content} testID="phone-new-subtitle">
            {texts.message}
          </SmallText>
          <View style={styles.inputTitleContainer} testID="phone-new-label">
            <Picture
              type="Svg"
              name="pictos-smartphone"
              fill={theme.palette.grey.black}
              width={UI_SIZES.dimensions.width.mediumPlus}
              height={UI_SIZES.dimensions.height.mediumPlus}
            />
            <SmallBoldText style={styles.inputTitle}>{texts.label}</SmallBoldText>
          </View>
          <PhoneInput
            placeholder={I18n.get('auth-change-mobile-placeholder')}
            ref={phoneInputRef}
            value={mobile}
            defaultCode={region}
            layout="third"
            onChangeFormattedText={onChangeMobile}
            onChangeCountry={onSetRegion}
            containerStyle={[
              { borderColor: isMobileStateClean ? theme.palette.grey.cloudy : theme.palette.status.failure.regular },
              styles.input,
            ]}
            flagButtonStyle={styles.flagButton}
            codeTextStyle={styles.flagCode}
            textContainerStyle={[
              styles.inputTextContainer,
              {
                borderColor: isMobileStateClean ? theme.palette.grey.cloudy : theme.palette.status.failure.regular,
              },
            ]}
            textInputStyle={styles.inputTextInput}
            flagSize={Platform.select({ android: UI_SIZES.dimensions.width.medium, ios: UI_SIZES.dimensions.width.larger })}
            drowDownImage={
              <Svg style={styles.dropDownArrow} name="ui-rafterDown" fill={theme.ui.text.regular} width={12} height={12} />
            }
            countryPickerProps={{
              filterProps: {
                autoFocus: true,
                placeholder: I18n.get('auth-change-mobile-country-placeholder'),
              },
              language: countryListLanguages[I18n.getLanguage()] ?? countryListLanguages.DEFAULT,
            }}
            testIDCountryWithCode="phone-new-country"
            textInputProps={{
              hitSlop: {
                bottom: -UI_SIZES.spacing.big,
                left: 0,
                right: 0,
                top: -UI_SIZES.spacing.big,
              },
              inputMode: 'tel',
              keyboardType: 'phone-pad',
              placeholderTextColor: theme.palette.grey.stone,
              testID: 'phone-new-field',
            }}
          />
          <CaptionItalicText style={styles.errorText} testID="phone-new-error">
            {isMobileStateClean ? I18n.get('common-space') : I18n.get('auth-change-mobile-error-invalid')}
          </CaptionItalicText>
          <PrimaryButton
            style={styles.sendButton}
            text={texts.button}
            disabled={isMobileEmpty}
            loading={isSendingCode}
            action={onSendSMS}
            testID="phone-change"
          />
          <DefaultButton
            style={styles.logoutButton}
            text={I18n.get('auth-change-mobile-verify-disconnect')}
            contentColor={theme.palette.status.failure.regular}
            action={onRefuseMobileVerification}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});
RequirementVerifyMobileScreenTemplate.displayName = 'RequirementVerifyMobileScreenTemplate';
