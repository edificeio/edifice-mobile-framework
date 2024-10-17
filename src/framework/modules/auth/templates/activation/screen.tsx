import styled from '@emotion/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import PrimaryButton from '~/framework/components/buttons/primary';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen } from '~/framework/components/empty-screens';
import { KeyboardPageView } from '~/framework/components/page';
import { CaptionItalicText, HeadingSText, SmallActionText, SmallText } from '~/framework/components/text';
import { useConstructor } from '~/framework/hooks/constructor';
import { loadAuthContextAction, loadPlatformLegalUrlsAction } from '~/framework/modules/auth/actions';
import { ActivationFormModel, ValueChangeArgs } from '~/framework/modules/auth/components/ActivationForm';
import { IActivationError, PlatformAuthContext } from '~/framework/modules/auth/model';
import { Loading } from '~/ui/Loading';

import PhoneInput, {
  Country,
  CountryCode,
  getFormattedNumber,
  isMobileNumber,
  isValidNumber,
} from 'react-native-phone-number-input';
import theme from '~/app/theme';
import AlertCard from '~/framework/components/alert';
import InputContainer from '~/framework/components/inputs/container';
import EmailInput from '~/framework/components/inputs/email/component';
import PasswordInput from '~/framework/components/inputs/password';
import { openPDFReader } from '~/framework/components/pdf/pdf-reader';
import { NamedSVG } from '~/framework/components/picture';
import toast from '~/framework/components/toast';
import { MobileState } from '~/framework/modules/auth//screens/change-mobile';
import { EmailState } from '~/framework/modules/auth/screens/change-email';
import { ValidatorBuilder } from '~/utils/form';
import styles from './newStyles';
import { ActivationScreenProps, ActivationScreenState, IFields } from './types';

const countryListLanguages = {
  fr: 'fra',
  en: 'common', // this is english
  es: 'spa',
  DEFAULT: 'common',
} as const;

const keyboardPageViewScrollViewProps = { showsVerticalScrollIndicator: false, bounces: false };
const ButtonWrapper = styled.View<{ error: any; typing: boolean }>();

const ActivationScreen = (props: ActivationScreenProps & { context: PlatformAuthContext }) => {
  const [state, setState] = useState<ActivationScreenState>({
    typing: false,
    acceptCGU: false,
    activationState: 'IDLE',
    activationCode: props.route.params.credentials.password,
    login: props.route.params.credentials.username,
    password: '',
    confirmPassword: '',
    mail: '',
    phone: '',
  });

  const { route, context, trySubmit } = props;
  const { password, confirmPassword, mail, phone, acceptCGU, typing, error, activationState } = state;
  const platform = route.params.platform;
  const formModel = new ActivationFormModel({
    ...context,
    phoneRequired: context?.mandatory?.phone ?? false,
    emailRequired: context?.mandatory?.mail ?? false,
    password: () => password,
  });
  const isNotValid = !acceptCGU || !formModel.validate({ ...state });
  const errorKey = formModel.firstErrorKey({ ...state });
  const errorText = errorKey ? I18n.get(errorKey) : error;
  // const errorText = errorKey ? 'truthy key' : 'falsy key';
  const hasErrorKey = !!errorText;
  const isSubmitLoading = activationState === 'RUNNING';
  const cguUrl = props.legalUrls?.cgu;
  const usercharterUrl = props.legalUrls?.userCharter;

  const mountedRef = useRef<boolean>(false);
  const [region, setRegion] = useState<CountryCode>('FR');
  const onSetRegion = useCallback((code: Country) => setRegion(code.cca2), [setRegion]);
  const [mobileState, setMobileState] = useState<MobileState>(MobileState.PRISTINE);
  const isMobileStateClean = mobileState === MobileState.STALE || mobileState === MobileState.PRISTINE;
  const [emailState, setEmailState] = useState<EmailState>(EmailState.PRISTINE);
  const isEmailStatePristine = emailState === EmailState.PRISTINE;

  const passwordRules = useMemo(
    () => (
      <>
        {context.passwordRegexI18nActivation?.[I18n.getLanguage()] ? (
          <AlertCard
            type="info"
            // clé i18n a ajouter ici
            // text={context.passwordRegexI18nActivation[I18n.getLanguage()]}
            text={'Le mot de passe doit contenir au moins 8 caractères dont au moins une majuscule, une minuscule et un chiffre.'}
            style={styles.alertCard}
            testID="activation-password-rules"
          />
        ) : null}
      </>
    ),
    [context.passwordRegexI18nActivation],
  );

  const onFieldChange = (key: IFields) => {
    return (valueChange: ValueChangeArgs<string>) => {
      setState(prevState => ({
        ...prevState,
        [key]: valueChange.value,
        typing: true,
      }));
    };
  };

  const doOpenLegalUrls = (title: string, url?: string) => {
    openPDFReader({ src: url, title });
  };

  const getIsValidMobileNumberForRegion = useCallback(
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

  const verifyAndFormatPhoneNumber = useCallback(
    (phoneNumber: string) => {
      // First, we clean the number by trimming - and . characters (generally used as separators)
      const phoneNumberCleaned = phoneNumber.replaceAll(/[-.]+/g, '');
      const isValidMobileNumberForRegion = getIsValidMobileNumberForRegion(phoneNumberCleaned);
      const mobileNumberFormatted = getFormattedNumber(phoneNumberCleaned, region);
      if (isValidMobileNumberForRegion && mobileNumberFormatted) {
        setMobileState(MobileState.PRISTINE);
        setState(prevState => ({
          ...prevState,
          phone: mobileNumberFormatted,
        }));
        return true;
      }
      // Exit if mobile is not valid
      if (!isValidMobileNumberForRegion || !mobileNumberFormatted) {
        setMobileState(MobileState.MOBILE_FORMAT_INVALID);
        return false;
      }
    },
    [getIsValidMobileNumberForRegion, region],
  );

  const verifyEmail = useCallback((toVerify: string) => {
    // Exit if email is not valid
    const verifiedEmail = new ValidatorBuilder().withEmail().build<string>().isValid(toVerify);
    if (verifiedEmail) return true;
    if (!verifiedEmail) {
      setEmailState(EmailState.EMAIL_FORMAT_INVALID);
      return false;
    }
  }, []);

  const onMailInputBlur = useCallback(() => verifyEmail(state.mail), [verifyEmail, state.mail]);
  const onPhoneInputBlur = useCallback(() => verifyAndFormatPhoneNumber(state.phone), [verifyAndFormatPhoneNumber, state.phone]);

  const doActivation = async () => {
    const isPhoneValid = verifyAndFormatPhoneNumber(state.phone);
    if (!isPhoneValid) {
      toast.showError(I18n.get('auth-change-mobile-error-text')); // MESSAGE A CHANGER
      return;
    }

    const isMailValid = verifyEmail(state.mail);
    if (!isMailValid) {
      toast.showError(I18n.get('auth-change-email-error-text')); // MESSAGE A CHANGER
      return;
    }
    try {
      console.log('platform ------>', route.params.platform);
      console.log('Staaaaaaaate BEFORE ---->', state);
      setState(prevState => ({
        ...prevState,
        typing: false,
        activationState: 'RUNNING',
        error: undefined,
      }));
      await trySubmit(route.params.platform, state);
    } catch (e) {
      const activationError = e as IActivationError;
      if (mountedRef.current) {
        setState(prevState => ({
          ...prevState,
          typing: false,
          activationState: 'IDLE',
          error: activationError.error,
        }));
      }
    }
    // finally {
    //   console.log('Staaaaaaaate AFTER ---->', state);
    // }
  };

  /**
   * Triggers form's setState on first render
   */
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <KeyboardPageView scrollable scrollViewProps={keyboardPageViewScrollViewProps} safeArea style={styles.page}>
      <Pressable onPress={() => formModel.blur()} style={styles.pressable}>
        <View style={styles.infos}>
          {/** clés i18n titre + renommer image + comment on gère une icone a 3 couleurs */}
          <NamedSVG name="ui-userSearchColorized" />
          <HeadingSText style={styles.infosText}>Bienvenue sur NEO !</HeadingSText>
          <SmallText style={styles.infosSubText}>
            Choisissez votre mot de passe et renseigner vos données personnelles pour sécuriser votre compte.
          </SmallText>
        </View>
        {passwordRules}
        <InputContainer
          label={{
            text: 'Mot de passe', // clé i18N
            icon: 'ui-lock',
          }}
          input={
            <PasswordInput
              placeholder={I18n.get('auth-changepassword-placeholder')} // clé i18n
              showIconCallback
              showError={formModel.showPasswordError(password)}
              annotation={formModel.showPasswordError(password) ? errorText : ''}
              value={password}
              onChangeText={formModel.password.changeCallback(onFieldChange('password'))}
              testID="activation-password"
              testIDToggle="activation-see-password"
            />
          }
        />

        <InputContainer
          style={styles.inputContainer}
          label={{
            text: 'Confirmer le mot de passe', // clé i18N
            icon: 'ui-lock',
          }}
          input={
            <PasswordInput
              placeholder={I18n.get('auth-changepassword-placeholder')} // clé i18n
              showIconCallback
              showError={formModel.showConfirmError(confirmPassword)}
              annotation={formModel.showConfirmError(confirmPassword) ? errorText : ''}
              value={confirmPassword}
              onChangeText={formModel.confirm.changeCallback(onFieldChange('confirmPassword'))}
              testID="activation-confirmed-password"
              testIDToggle="activation-see-confirmed-password"
            />
          }
        />

        <InputContainer
          label={{
            text: 'Adresse mail', // clé i18N
            icon: 'ui-mail',
          }}
          input={
            <>
              <EmailInput
                style={[
                  styles.emailInput,
                  { borderColor: isEmailStatePristine ? theme.palette.grey.stone : theme.palette.status.failure.regular },
                ]}
                value={mail}
                onChangeText={formModel.email.changeCallback(onFieldChange('mail'))}
                placeholder="Saisir l'adresse mail"
                onBlur={onMailInputBlur}
                testID="activation-email"
              />
              <CaptionItalicText style={styles.errorText}>
                {/** clé i18n a changer */}
                {isEmailStatePristine ? I18n.get('common-space') : I18n.get('auth-change-email-error-invalid')}
              </CaptionItalicText>
            </>
          }
        />

        <InputContainer
          style={styles.phoneInputContainer}
          label={{
            text: 'Téléphone mobile', // clé i18N
            icon: 'ui-smartphone',
          }}
          input={
            <>
              <PhoneInput
                placeholder={I18n.get('auth-change-mobile-placeholder')}
                value={phone}
                defaultCode={region}
                layout="third"
                onChangeText={formModel.phone.changeCallback(onFieldChange('phone'))}
                onChangeCountry={onSetRegion}
                containerStyle={[
                  { borderColor: isMobileStateClean ? theme.palette.grey.cloudy : theme.palette.status.failure.regular },
                  styles.phoneInput,
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
                flagSize={Platform.select({
                  ios: UI_SIZES.dimensions.width.larger,
                  android: UI_SIZES.dimensions.width.medium,
                })}
                drowDownImage={
                  <NamedSVG style={styles.dropDownArrow} name="ui-rafterDown" fill={theme.ui.text.regular} width={12} height={12} />
                }
                countryPickerProps={{
                  filterProps: {
                    placeholder: I18n.get('auth-change-mobile-country-placeholder'),
                    autoFocus: true,
                  },
                  language: countryListLanguages[I18n.getLanguage()] ?? countryListLanguages.DEFAULT,
                }}
                testIDCountryWithCode="phone-new-country"
                textInputProps={{
                  hitSlop: {
                    top: -UI_SIZES.spacing.big,
                    bottom: -UI_SIZES.spacing.big,
                    left: 0,
                    right: 0,
                  },
                  keyboardType: 'phone-pad',
                  inputMode: 'tel',
                  placeholderTextColor: theme.palette.grey.stone,
                  onBlur: onPhoneInputBlur,
                  testID: 'activation-phone',
                }}
              />
              <CaptionItalicText style={styles.errorText}>
                {isMobileStateClean ? I18n.get('common-space') : I18n.get('auth-change-mobile-error-invalid')}
              </CaptionItalicText>
            </>
          }
        />
        <View style={styles.cguWrapper}>
          <Checkbox
            checked={acceptCGU}
            onPress={() =>
              setState(prevState => ({
                ...prevState,
                acceptCGU: !acceptCGU,
              }))
            }
            customContainerStyle={{ marginRight: UI_SIZES.spacing.minor }}
            testID="activation-accept-legal-condition"
          />
          <View style={styles.cguText} testID="activation-legal-condition">
            <SmallText>{I18n.get('auth-activation-cgu-accept')}</SmallText>
            <SmallActionText
              onPress={() => doOpenLegalUrls(I18n.get('user-legalnotice-usercharter'), usercharterUrl)}
              testID="activation-user-charter">
              {I18n.get('auth-activation-usercharter')}
            </SmallActionText>
            <SmallText>{I18n.get('auth-activation-cgu-accept-and')}</SmallText>
            <SmallActionText onPress={() => doOpenLegalUrls(I18n.get('auth-activation-cgu'), cguUrl)} testID="activation-cgu">
              {I18n.get('auth-activation-cgu')}
            </SmallActionText>
          </View>
        </View>
        <SmallText style={styles.errorMsg}>
          {(hasErrorKey || errorText) && !typing ? I18n.get('auth-activation-errorsubmit') : ''}
        </SmallText>
        <ButtonWrapper error={hasErrorKey} typing={typing} style={styles.buttonWrapper}>
          <PrimaryButton
            action={() => doActivation()}
            disabled={isNotValid}
            text={I18n.get('auth-activation-activate')}
            loading={isSubmitLoading}
            testID="activation-activate"
          />
        </ButtonWrapper>
      </Pressable>
    </KeyboardPageView>
  );
};

const ActivationScreenLoader = (props: ActivationScreenProps) => {
  const { context, legalUrls, validReactionTypes, route } = props;

  const platform = route.params.platform;
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  useConstructor(async () => {
    if (!context && platform) {
      dispatch(loadAuthContextAction(platform));
    }
    if (!legalUrls && platform) {
      dispatch(loadPlatformLegalUrlsAction(platform));
    }
  });

  if (!platform) return <EmptyConnectionScreen />;
  if (!context || !legalUrls || !validReactionTypes) return <Loading />;
  else return <ActivationScreen {...props} context={context} legalUrls={legalUrls} />;
};

export default ActivationScreenLoader;
