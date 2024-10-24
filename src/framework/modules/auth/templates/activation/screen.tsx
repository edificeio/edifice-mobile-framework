import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';

import styled from '@emotion/native';
import PhoneInput, {
  Country,
  CountryCode,
  getFormattedNumber,
  isMobileNumber,
  isValidNumber,
} from 'react-native-phone-number-input';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import styles from './newStyles';
import { ActivationScreenProps, ActivationScreenState, IFields } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import AlertCard from '~/framework/components/alert';
import PrimaryButton from '~/framework/components/buttons/primary';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen } from '~/framework/components/empty-screens';
import InputContainer from '~/framework/components/inputs/container';
import { LabelIndicator } from '~/framework/components/inputs/container/label';
import EmailInput from '~/framework/components/inputs/email/component';
import PasswordInput from '~/framework/components/inputs/password';
import { KeyboardPageView } from '~/framework/components/page';
import { openPDFReader } from '~/framework/components/pdf/pdf-reader';
import { NamedSVG } from '~/framework/components/picture';
import { CaptionItalicText, HeadingSText, SmallActionText, SmallText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import { useConstructor } from '~/framework/hooks/constructor';
import { loadAuthContextAction, loadPlatformLegalUrlsAction } from '~/framework/modules/auth/actions';
import { ActivationFormModel, ValueChangeArgs } from '~/framework/modules/auth/components/ActivationForm';
import { IActivationError, LegalUrls, PlatformAuthContext } from '~/framework/modules/auth/model';
import { Loading } from '~/ui/Loading';
import { ValidatorBuilder } from '~/utils/form';

const ActivationScreenLoader = (props: ActivationScreenProps) => {
  const { context, legalUrls, route, validReactionTypes } = props;

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

const countryListLanguages = {
  DEFAULT: 'common',
  en: 'common',
  es: 'spa',
  fr: 'fra',
} as const;

const keyboardPageViewScrollViewProps = { bounces: false, showsVerticalScrollIndicator: false };
const ButtonWrapper = styled.View<{ error: any; typing: boolean }>();

export class ActivationScreen extends React.PureComponent<
  ActivationScreenProps & { context: PlatformAuthContext; legalUrls: LegalUrls },
  ActivationScreenState
> {
  private mounted = false;

  // fully controller component
  public state: ActivationScreenState = {
    acceptCGU: false,
    activationCode: this.props.route.params.credentials.password,
    activationState: 'IDLE',
    confirmPassword: '',
    login: this.props.route.params.credentials.username,
    mail: '',
    mailState: 'PRISTINE',
    password: '',
    phone: '',
    phoneCountry: 'FR',
    phoneState: 'PRISTINE',
    typing: false,
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount(): void {
    this.mounted = false;
  }

  private doActivation = async () => {
    try {
      this.setState({ activationState: 'RUNNING', error: undefined, typing: false });
      await this.props.trySubmit(this.props.route.params.platform, this.state);
    } catch (e) {
      const activationError = e as IActivationError;
      toast.showError("Nous n'avons pas pu procéder à l'activation du compte, merci de réessayer ultérieurement"); // clé i18n
      if (this.mounted) this.setState({ activationState: 'IDLE', error: activationError.error, typing: false });
    }
  };

  private onFieldChange = (key: IFields) => {
    return (valueChange: ValueChangeArgs<string>) => {
      const newState: Partial<ActivationScreenState> = {
        [key]: valueChange.value,
        typing: true,
      };
      this.setState(newState as any);
    };
  };

  private onMailInputBlur = () => {
    const { mail } = this.state;
    this.verifyEmail(mail);
  };

  private onPhoneInputBlur = () => {
    const { phone } = this.state;
    this.verifyAndFormatPhoneNumber(phone);
  };

  private onSetCountry = (newCountry: Country): void => {
    const country: CountryCode = newCountry.cca2;
    this.setState({ phoneCountry: country });
  };

  private doOpenLegalUrls = (title: string, url?: string) => {
    openPDFReader({ src: url, title });
  };

  private getIsValidMobileNumberForRegion = (toVerify: string) => {
    try {
      // Returns whether number is valid for selected region and an actual mobile number
      const isValidNumberForRegion = isValidNumber(toVerify, this.state.phoneCountry);
      const isValidMobileNumber = isMobileNumber(toVerify, this.state.phoneCountry);
      return isValidNumberForRegion && isValidMobileNumber;
    } catch {
      // Returns false in case of format error (string is too short, isn't recognized as a phone number, etc.)
      return false;
    }
  };

  private verifyAndFormatPhoneNumber = (phoneNumber: string) => {
    const phoneNumberCleaned = phoneNumber.replaceAll(/[-.]+/g, '');
    const isValidMobileNumberForRegion = this.getIsValidMobileNumberForRegion(phoneNumberCleaned);
    const mobileNumberFormatted = getFormattedNumber(phoneNumberCleaned, this.state.phoneCountry);
    if (isValidMobileNumberForRegion && mobileNumberFormatted) {
      this.setState(prevState => ({
        ...prevState,
        phone: mobileNumberFormatted,
        phoneState: 'PRISTINE',
      }));
      return true;
    }
    // Exit if mobile is not valid
    if (!isValidMobileNumberForRegion || !mobileNumberFormatted) {
      this.setState({ phoneState: 'MOBILE_FORMAT_INVALID' });
      return false;
    }
  };

  private verifyEmail = (toVerify: string) => {
    const verifiedEmail = new ValidatorBuilder().withEmail().build<string>().isValid(toVerify);
    if (verifiedEmail) {
      this.setState(prevState => ({
        ...prevState,
        mailState: 'PRISTINE',
      }));
      return true;
    }
    if (!verifiedEmail) {
      this.setState({ mailState: 'EMAIL_FORMAT_INVALID' });
      return false;
    }
  };

  public render() {
    const { acceptCGU, activationState, confirmPassword, error, mail, password, phone, typing } = this.state;
    const { context } = this.props;
    const formModel = new ActivationFormModel({
      ...context,
      emailRequired: context?.mandatory?.mail ?? false,
      password: () => password,
      phoneRequired: context?.mandatory?.phone ?? false,
    });
    const isNotValid = !acceptCGU || !formModel.validate({ ...this.state });
    const errorKey = typing ? formModel.firstErrorKey({ ...this.state }) : undefined;
    const errorText = errorKey ? I18n.get(errorKey) : error;
    const hasErrorKey = !!errorText;
    const isSubmitLoading = activationState === 'RUNNING';
    const cguUrl = this.props.legalUrls?.cgu;
    const usercharterUrl = this.props.legalUrls?.userCharter;
    const isMobileStateClean = this.state.phoneState === 'PRISTINE';
    const isEmailStatePristine = this.state.mailState === 'PRISTINE';
    const isEmailRequired = context.mandatory?.mail === true;
    const isPhoneRequired = context.mandatory?.phone === true;

    const passwordRules = (
      <>
        {context.passwordRegexI18nActivation?.[I18n.getLanguage()] ? (
          <AlertCard
            type="info"
            text={context.passwordRegexI18nActivation[I18n.getLanguage()]}
            style={styles.alertCard}
            testID="activation-password-rules"
          />
        ) : null}
      </>
    );

    return (
      <KeyboardPageView scrollable scrollViewProps={keyboardPageViewScrollViewProps} safeArea style={styles.page}>
        <Pressable onPress={() => formModel.blur()} style={styles.pressable}>
          <View style={styles.infos}>
            <NamedSVG name="ui-userSearchColor" />
            <HeadingSText style={styles.infosText}>Bienvenue sur NEO !</HeadingSText>
            {/* <HeadingSText style={styles.infosText}>{I18n.get('auth-activation-welcome-neo')}</HeadingSText> */}
            <SmallText style={styles.infosSubText}>{I18n.get('auth-activation-form-infos')}</SmallText>
          </View>
          {passwordRules}
          <InputContainer
            label={{
              icon: 'ui-lock',
              indicator: LabelIndicator.REQUIRED,
              text: I18n.get('auth-activation-password'),
            }}
            input={
              <PasswordInput
                annotation={formModel.showPasswordError(password) ? errorText : ''}
                onChangeText={formModel.password.changeCallback(this.onFieldChange('password'))}
                placeholder={I18n.get('auth-activation-password-placeholder')}
                showError={formModel.showPasswordError(password)}
                showIconCallback
                testID="activation-password"
                testIDToggle="activation-see-password"
                value={password}
              />
            }
          />

          <InputContainer
            style={styles.inputContainer}
            label={{
              icon: 'ui-lock',
              indicator: LabelIndicator.REQUIRED,
              text: I18n.get('auth-activation-password-confirmation'),
            }}
            input={
              <PasswordInput
                annotation={formModel.showConfirmError(confirmPassword) ? errorText : ''}
                onChangeText={formModel.confirm.changeCallback(this.onFieldChange('confirmPassword'))}
                placeholder={I18n.get('auth-activation-password-placeholder')}
                showError={formModel.showConfirmError(confirmPassword)}
                showIconCallback
                testID="activation-confirmed-password"
                testIDToggle="activation-see-confirmed-password"
                value={confirmPassword}
              />
            }
          />

          <InputContainer
            label={{
              icon: 'ui-mail',
              indicator: isEmailRequired ? LabelIndicator.REQUIRED : LabelIndicator.OPTIONAL,
              text: I18n.get('auth-activation-email-address'),
            }}
            input={
              <EmailInput
                annotation={isEmailStatePristine ? I18n.get('common-space') : I18n.get('auth-activation-email-error-invalid')}
                onBlur={this.onMailInputBlur}
                onChangeText={formModel.email.changeCallback(this.onFieldChange('mail'))}
                placeholder={I18n.get('auth-activation-email-placeholder')}
                showError={isEmailStatePristine ? undefined : formModel.showEmailError(mail)}
                testID="activation-email"
                value={mail}
              />
            }
          />

          <InputContainer
            style={styles.phoneInputContainer}
            label={{
              icon: 'ui-smartphone',
              indicator: isPhoneRequired ? LabelIndicator.REQUIRED : LabelIndicator.OPTIONAL,
              text: I18n.get('auth-activation-mobile'),
            }}
            input={
              <>
                <PhoneInput
                  placeholder={I18n.get('auth-activation-mobile-placeholder')}
                  value={phone}
                  defaultCode={this.state.phoneCountry}
                  layout="third"
                  onChangeText={formModel.phone.changeCallback(this.onFieldChange('phone'))}
                  onChangeCountry={this.onSetCountry}
                  containerStyle={[
                    {
                      borderColor: isMobileStateClean ? theme.palette.grey.cloudy : theme.palette.status.failure.regular,
                    },
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
                    android: UI_SIZES.dimensions.width.medium,
                    ios: UI_SIZES.dimensions.width.larger,
                  })}
                  drowDownImage={
                    <NamedSVG
                      style={styles.dropDownArrow}
                      name="ui-rafterDown"
                      fill={theme.ui.text.regular}
                      width={12}
                      height={12}
                    />
                  }
                  countryPickerProps={{
                    filterProps: {
                      autoFocus: true,
                      placeholder: I18n.get('auth-change-mobile-country-placeholder'), // change
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
                    onBlur: this.onPhoneInputBlur,
                    placeholderTextColor: theme.palette.grey.stone,
                    testID: 'activation-phone',
                  }}
                />
                <CaptionItalicText style={styles.errorText}>
                  {isMobileStateClean ? I18n.get('common-space') : I18n.get('auth-error-activation-mobile-invalid')}
                </CaptionItalicText>
              </>
            }
          />
          <View style={styles.cguWrapper}>
            <Checkbox
              checked={acceptCGU}
              onPress={() => this.setState({ acceptCGU: !acceptCGU })}
              customContainerStyle={{ marginRight: UI_SIZES.spacing.minor }}
            />
            <View style={styles.cguText}>
              <SmallText>{I18n.get('auth-activation-cgu-accept')}</SmallText>
              <SmallActionText onPress={() => this.doOpenLegalUrls(I18n.get('user-legalnotice-usercharter'), usercharterUrl)}>
                {I18n.get('auth-activation-usercharter')}
              </SmallActionText>
              <SmallText>{I18n.get('auth-activation-cgu-accept-and')}</SmallText>
              <SmallActionText onPress={() => this.doOpenLegalUrls(I18n.get('auth-activation-cgu'), cguUrl)}>
                {I18n.get('auth-activation-cgu')}
              </SmallActionText>
            </View>
          </View>
          <SmallText style={styles.errorMsg}>
            {(hasErrorKey || errorText) && !typing ? I18n.get('auth-activation-errorsubmit') : ''}
          </SmallText>
          <ButtonWrapper error={hasErrorKey} typing={typing}>
            <PrimaryButton
              action={() => this.doActivation()}
              disabled={isNotValid}
              text={I18n.get('auth-activation-activate')}
              loading={isSubmitLoading}
            />
          </ButtonWrapper>
        </Pressable>
      </KeyboardPageView>
    );
  }
}
