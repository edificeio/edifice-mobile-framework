import styled from '@emotion/native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
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
import { ActivationFormModel } from '~/framework/modules/auth/components/ActivationForm';
import { LegalUrls, PlatformAuthContext } from '~/framework/modules/auth/model';
import { Loading } from '~/ui/Loading';

import PhoneInput from 'react-native-phone-number-input';
import theme from '~/app/theme';
import AlertCard from '~/framework/components/alert';
import InputContainer from '~/framework/components/inputs/container';
import EmailInput from '~/framework/components/inputs/email/component';
import PasswordInput from '~/framework/components/inputs/password';
import { NamedSVG } from '~/framework/components/picture';
import styles from './newStyles';
import { ActivationScreenProps, ActivationScreenState } from './types';

const countryListLanguages = {
  fr: 'fra',
  en: 'common', // this is english
  es: 'spa',
  DEFAULT: 'common',
} as const;

const keyboardPageViewScrollViewProps = { showsVerticalScrollIndicator: false, bounces: false };

// const ButtonWrapper = styled.View<{ error: any; typing: boolean }>({
//   alignItems: 'center',
//   flexGrow: 2,
//   justifyContent: 'flex-start',
//   marginBottom: UI_SIZES.spacing.big,
// });

const ButtonWrapper = styled.View<{ error: any; typing: boolean }>();

// passwordRules à refaire avec useMemo
// const passwordRules = () => (
//   <View style={styles.infos}>
//     <NamedSVG name="ui-lock-alternate" />
//     <SmallText style={styles.infosText} testID="change-password-rules">
//       mais nan
//     </SmallText>
//   </View>
// );

export class ActivationScreen extends React.PureComponent<
  ActivationScreenProps & { context: PlatformAuthContext; legalUrls: LegalUrls },
  ActivationScreenState
> {
  private mounted = false;

  public state: ActivationScreenState = {
    typing: false,
    acceptCGU: false,
    activationState: 'IDLE',
    activationCode: this.props.route.params.credentials.password,
    login: this.props.route.params.credentials.username,
    password: '',
    confirmPassword: '',
    mail: '',
    phone: '',
  };

  public render() {
    const { password, confirmPassword, mail, phone, acceptCGU, typing, error, activationState } = this.state;
    const { platform } = this.props.route.params;
    const { context } = this.props;
    const formModel = new ActivationFormModel({
      ...context,
      phoneRequired: context?.mandatory?.phone ?? false,
      emailRequired: context?.mandatory?.mail ?? false,
      password: () => password,
    });
    const isNotValid = !acceptCGU || !formModel.validate({ ...this.state });
    const errorKey = formModel.firstErrorKey({ ...this.state });
    const errorText = errorKey ? I18n.get(errorKey) : error;
    const hasErrorKey = !!errorText;
    const isSubmitLoading = activationState === 'RUNNING';
    const cguUrl = this.props.legalUrls?.cgu;
    const usercharterUrl = this.props.legalUrls?.userCharter;

    return (
      <KeyboardPageView scrollable scrollViewProps={keyboardPageViewScrollViewProps} safeArea style={styles.page}>
        <Pressable onPress={() => formModel.blur()} style={styles.pressable}>
          <View style={styles.infos}>
            <NamedSVG name="ui-userSearchColorized" />
            {/**
             * clés i18n a rajouter pour les 2 textes ici, + tte cette view à mettre dans une const passwordRules w/useMemo (cf changePWD)
             */}
            <HeadingSText style={styles.infosText}>Bienvenue sur NEO !</HeadingSText>
            <SmallText style={styles.infosSubText} testID="change-password-rules">
              Choisissez votre mot de passe et renseigner vos données personnelles pour sécuriser votre compte.
            </SmallText>
          </View>
          {/* {passwordRules} */}
          {context.passwordRegexI18nActivation?.[I18n.getLanguage()] ? (
            <AlertCard
              type="info"
              // clé i18n a ajouter ici
              text={'Le mot de passe doit contenir au moins 8 caractères dont au moins une majuscule, une minuscule et un chiffre.'}
              style={styles.alertCard}
            />
          ) : null}
          <InputContainer
            style={styles.inputContainer}
            label={{
              text: 'Mot de passe', // clé i18N
              icon: 'ui-lock',
              testID: 'check', // testID à remettre
            }}
            input={
              <PasswordInput
                placeholder={I18n.get('auth-changepassword-placeholder')}
                showIconCallback
                // showError={() => console.log('ERROR PWD')}
                value={password}
                onChangeText={() => console.log(' NEW COMPONENT pwd is changing')}
                annotation=" "
                testID="check" // testID à remettre
                testIDToggle="check" // testID à remettre
              />
            }
          />

          <InputContainer
            style={styles.inputContainer}
            label={{
              text: 'Confirmer le mot de passe', // clé i18N
              icon: 'ui-lock',
              testID: 'check', // testID à remettre
            }}
            input={
              <PasswordInput
                placeholder={I18n.get('auth-changepassword-placeholder')}
                showIconCallback
                // showError={() => console.log('ERROR PWD')}
                value={confirmPassword}
                onChangeText={() => console.log(' NEW COMP pwd is changing')}
                annotation=" "
                testID="check" // testID à remettre
                testIDToggle="check" // testID à remettre
              />
            }
          />

          <InputContainer
            style={styles.inputContainer}
            label={{
              text: 'Adresse mail', // clé i18N
              icon: 'ui-mail',
              testID: 'check', // testID à remettre
            }}
            input={
              <EmailInput
                style={styles.emailInput}
                value={mail}
                onChangeText={() => {
                  console.log('changing mail input');
                }}
                placeholder="Saisir l'adresse mail"
              />
            }
          />

          <InputContainer
            style={styles.inputContainer}
            label={{
              text: 'Téléphone mobile', // clé i18N
              icon: 'ui-smartphone',
              testID: 'check', // testID à remettre
            }}
            input={
              <>
                <PhoneInput
                  placeholder={I18n.get('auth-change-mobile-placeholder')}
                  // ref={phoneInputRef}
                  value={phone}
                  // defaultCode={region}
                  layout="third"
                  onChangeFormattedText={() => console.log('onChangeFormattedText phone')}
                  onChangeCountry={() => console.log('onSetRegion phone')}
                  // containerStyle={[
                  //   { borderColor: isMobileStateClean ? theme.palette.grey.cloudy : theme.palette.status.failure.regular },
                  //   styles.input,
                  // ]}
                  // containerStyle={[{ borderColor: theme.palette.grey.cloudy }, styles.input]}
                  containerStyle={[{ borderColor: theme.palette.grey.cloudy }, styles.phoneInput]}
                  flagButtonStyle={styles.flagButton}
                  codeTextStyle={styles.flagCode}
                  // textContainerStyle={[
                  //   styles.inputTextContainer,
                  //   {
                  //     borderColor: isMobileStateClean ? theme.palette.grey.cloudy : theme.palette.status.failure.regular,
                  //   },
                  // ]}
                  textContainerStyle={[
                    styles.inputTextContainer,
                    {
                      borderColor: theme.palette.grey.cloudy,
                    },
                  ]}
                  textInputStyle={styles.inputTextInput}
                  // flagSize={Platform.select({
                  //   ios: UI_SIZES.dimensions.width.larger,
                  //   android: UI_SIZES.dimensions.width.medium,
                  // })}
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
                    testID: 'phone-new-field',
                  }}
                />
                <CaptionItalicText style={styles.errorText} testID="phone-new-error">
                  {/* {isMobileStateClean ? I18n.get('common-space') : I18n.get('auth-change-mobile-error-invalid')} */}
                  {I18n.get('common-space')}
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
              <SmallActionText onPress={() => console.log('ça doit open le pdf user charte')}>
                {I18n.get('auth-activation-usercharter')}
              </SmallActionText>
              <SmallText>{I18n.get('auth-activation-cgu-accept-and')}</SmallText>
              <SmallActionText onPress={() => console.log('ça doit open le pdf legal conditions')}>
                {I18n.get('auth-activation-cgu')}
              </SmallActionText>
            </View>
          </View>
          <SmallText style={styles.errorMsg}>
            {(hasErrorKey || errorText) && !typing ? I18n.get('auth-activation-errorsubmit') : ''}
          </SmallText>
          <ButtonWrapper error={hasErrorKey} typing={typing} style={styles.buttonWrapper}>
            <PrimaryButton
              // action={() => this.doActivation()}
              disabled={isNotValid}
              text={I18n.get('auth-activation-activate')}
              loading={isSubmitLoading}
            />
          </ButtonWrapper>
        </Pressable>
      </KeyboardPageView>
    );
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount(): void {
    this.mounted = false;
  }
}

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
