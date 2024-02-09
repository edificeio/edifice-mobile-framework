/* eslint-disable react/jsx-max-depth */
import styled from '@emotion/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { KeyboardAvoidingView, Platform as RNPlatform, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { connect, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import AlertCard from '~/framework/components/alert';
import PrimaryButton from '~/framework/components/buttons/primary';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen } from '~/framework/components/empty-screens';
import { PageView } from '~/framework/components/page';
import { openPDFReader } from '~/framework/components/pdf/pdf-reader';
import { PFLogo } from '~/framework/components/pfLogo';
import { SmallActionText, SmallText } from '~/framework/components/text';
import { useConstructor } from '~/framework/hooks/constructor';
import { activateAccountAction, loadAuthContextAction, loadPlatformLegalUrlsAction } from '~/framework/modules/auth/actions';
import {
  ActivationFormModel,
  InputEmail,
  InputPassword,
  InputPasswordConfirm,
  InputPhone,
  ValueChangeArgs,
} from '~/framework/modules/auth/components/ActivationForm';
import {
  IActivationPayload as ActivationPayload,
  IActivationError,
  LegalUrls,
  PlatformAuthContext,
} from '~/framework/modules/auth/model';
import { IAuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getPlatformContextOf, getPlatformLegalUrlsOf } from '~/framework/modules/auth/reducer';
import { tryAction } from '~/framework/util/redux/actions';
import { Loading } from '~/ui/Loading';

// TYPES ---------------------------------------------------------------------------

type IFields = 'login' | 'password' | 'confirmPassword' | 'phone' | 'mail';

export interface ActivationScreenState extends ActivationPayload {
  typing: boolean;
  acceptCGU: boolean;
  error?: string;
  activationState: 'IDLE' | 'RUNNING' | 'DONE';
}
export interface ActivationPrivateProps {}
export interface ActivationScreenStoreProps {
  legalUrls?: LegalUrls;
  context?: PlatformAuthContext;
}
export interface ActivationScreenDispatchProps {
  trySubmit: (...args: Parameters<typeof activateAccountAction>) => ReturnType<ReturnType<typeof activateAccountAction>>;
}
export type ActivationScreenProps = ActivationPrivateProps &
  ActivationScreenDispatchProps &
  ActivationScreenStoreProps &
  NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.activation>;

// Activation Page Component -------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.ui.background.card },
  flexGrow1: { flexGrow: 1 },
  cguWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: UI_SIZES.spacing.big,
  },
  cguText: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    flex: 1,
  },
  errorMsg: {
    flexGrow: 0,
    marginTop: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
    alignSelf: 'center',
    color: theme.palette.status.failure.regular,
  },
  alertCard: { marginTop: UI_SIZES.spacing.medium },
});

const FormTouchable = styled.TouchableWithoutFeedback({ flex: 1 });
const FormWrapper = styled.View({ flex: 1 });
const FormContainer = styled.View({
  alignItems: 'center',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  margin: UI_SIZES.spacing.large,
  marginTop: UI_SIZES.spacing.huge,
});
const LogoWrapper = styled.View({
  flexGrow: 2,
  alignItems: 'center',
  justifyContent: 'center',
});
const ButtonWrapper = styled.View<{ error: any; typing: boolean }>({
  alignItems: 'center',
  flexGrow: 2,
  justifyContent: 'flex-start',
  marginTop: UI_SIZES.spacing.small,
});

export class ActivationScreen extends React.PureComponent<
  ActivationScreenProps & { context: PlatformAuthContext; legalUrls: LegalUrls },
  ActivationScreenState
> {
  private mounted = false;

  // fully controller component
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

  private doActivation = async () => {
    try {
      this.setState({ typing: false, activationState: 'RUNNING', error: undefined });
      await this.props.trySubmit(this.props.route.params.platform, this.state);
    } catch (e) {
      const activationError = e as IActivationError;
      if (this.mounted) this.setState({ typing: false, error: activationError.error, activationState: 'IDLE' });
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

  private doOpenLegalUrls = (title: string, url?: string) => {
    openPDFReader({ src: url, title });
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
      <PageView>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView style={styles.safeArea} behavior={RNPlatform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView alwaysBounceVertical={false} overScrollMode="never" contentContainerStyle={styles.flexGrow1}>
              <FormTouchable onPress={() => formModel.blur()}>
                <FormWrapper>
                  <FormContainer>
                    <LogoWrapper>
                      <PFLogo pf={platform} />
                    </LogoWrapper>
                    {/* <InputLogin login={login} form={formModel} onChange={this.onChange('login')} /> */}
                    {context.passwordRegexI18n?.[I18n.getLanguage()] ? (
                      <AlertCard type="info" text={context.passwordRegexI18n[I18n.getLanguage()]} style={styles.alertCard} />
                    ) : null}
                    <InputPassword password={password} form={formModel} onChange={this.onFieldChange('password')} />
                    <InputPasswordConfirm
                      confirm={confirmPassword}
                      form={formModel}
                      onChange={this.onFieldChange('confirmPassword')}
                    />
                    <InputEmail email={mail} form={formModel} onChange={this.onFieldChange('mail')} />
                    <InputPhone phone={phone} form={formModel} onChange={this.onFieldChange('phone')} />
                    <View style={styles.cguWrapper}>
                      <Checkbox
                        checked={acceptCGU}
                        onPress={() => this.setState({ acceptCGU: !acceptCGU })}
                        customContainerStyle={{ marginRight: UI_SIZES.spacing.minor }}
                      />
                      <View style={styles.cguText}>
                        <SmallText>{I18n.get('auth-activation-cgu-accept')}</SmallText>
                        <SmallActionText
                          onPress={() => this.doOpenLegalUrls(I18n.get('user-legalnotice-usercharter'), usercharterUrl)}>
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
                  </FormContainer>
                </FormWrapper>
              </FormTouchable>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </PageView>
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
  const { context, legalUrls, route } = props;
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
  if (!context || !legalUrls) return <Loading />;
  else return <ActivationScreen {...props} context={context} legalUrls={legalUrls} />;
};

export default connect(
  (
    state: IGlobalState,
    props: ActivationPrivateProps & NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.activation>,
  ) => {
    return {
      context: getPlatformContextOf(props.route.params.platform),
      legalUrls: getPlatformLegalUrlsOf(props.route.params.platform),
    };
  },
  dispatch => {
    const dprops = bindActionCreators<ActivationScreenDispatchProps>(
      {
        trySubmit: tryAction(activateAccountAction),
      },
      dispatch,
    );
    return dprops;
  },
)(ActivationScreenLoader);
