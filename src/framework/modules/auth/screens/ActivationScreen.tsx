import styled from '@emotion/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import {
  KeyboardAvoidingView,
  Platform as RNPlatform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import AlertCard from '~/framework/components/alert';
import PrimaryButton from '~/framework/components/buttons/primary';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { openPDFReader } from '~/framework/components/pdf/pdf-reader';
import { PFLogo } from '~/framework/components/pfLogo';
import { SmallActionText, SmallText } from '~/framework/components/text';
import { ILoginResult, activateAccountAction } from '~/framework/modules/auth/actions';
import {
  ActivationFormModel,
  InputEmail,
  InputPassword,
  InputPasswordConfirm,
  InputPhone,
  ValueChangeArgs,
} from '~/framework/modules/auth/components/ActivationForm';
import { IActivationError, IActivationPayload, LegalUrls } from '~/framework/modules/auth/model';
import { IAuthNavigationParams, authRouteNames, redirectLoginNavAction } from '~/framework/modules/auth/navigation';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';
import { Platform } from '~/framework/util/appConf';
import { tryAction } from '~/framework/util/redux/actions';

// TYPES ---------------------------------------------------------------------------

type IFields = 'login' | 'password' | 'confirmPassword' | 'phone' | 'mail';

export interface IActivationPageState extends IActivationPayload {
  typing: boolean;
  acceptCGU: boolean;
  error?: string;
  activationState: 'IDLE' | 'RUNNING' | 'DONE';
}
export interface IActivationPageDataProps {
  legalUrls?: LegalUrls;
}
export interface IActivationPageEventProps {
  trySubmit: (platform: Platform, payload: IActivationPayload, rememberMe?: boolean) => Promise<ILoginResult>;
}
export type IActivationPageProps = IActivationPageEventProps &
  IActivationPageDataProps &
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

export class ActivationPage extends React.PureComponent<IActivationPageProps, IActivationPageState> {
  private mounted = false;

  // fully controller component
  public state: IActivationPageState = {
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
      const redirect = await this.props.trySubmit(this.props.route.params.platform, this.state, this.props.route.params.rememberMe);
      if (redirect) {
        redirectLoginNavAction(redirect, this.props.route.params.platform, this.props.navigation);
        setTimeout(() => {
          // We set timeout to let the app time to navigate before resetting the state of this screen in background
          if (this.mounted) this.setState({ typing: false, activationState: 'IDLE', error: undefined });
        }, 500);
      } else {
        if (this.mounted) this.setState({ typing: false, activationState: 'DONE', error: undefined });
      }
    } catch (e) {
      const activationError = e as IActivationError;
      if (this.mounted) this.setState({ typing: false, error: activationError.error, activationState: 'IDLE' });
    }
  };

  private onFieldChange = (key: IFields) => {
    return (valueChange: ValueChangeArgs<string>) => {
      const newState: Partial<IActivationPageState> = {
        [key]: valueChange.value,
        typing: true,
      };
      this.setState(newState as any);
    };
  };

  private doOpenCGU = (url?: string) => {
    openPDFReader({ src: url, title: I18n.get('auth-activation-cgu') });
  };

  public render() {
    const { password, confirmPassword, mail, phone, acceptCGU, typing, error, activationState } = this.state;
    const authContext = this.props.route.params.context;
    const formModel = new ActivationFormModel({
      ...authContext,
      phoneRequired: authContext?.mandatory?.phone ?? false,
      emailRequired: authContext?.mandatory?.mail ?? false,
      password: () => password,
    });
    const isNotValid = !acceptCGU || !formModel.validate({ ...this.state });
    const errorKey = formModel.firstErrorKey({ ...this.state });
    const errorText = errorKey ? I18n.get(errorKey) : error;
    const hasErrorKey = !!errorText;
    const isSubmitLoading = activationState === 'RUNNING';
    const cguUrl = this.props.legalUrls?.cgu;

    return (
      <PageView>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView style={styles.safeArea} behavior={RNPlatform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView alwaysBounceVertical={false} overScrollMode="never" contentContainerStyle={styles.flexGrow1}>
              <FormTouchable onPress={() => formModel.blur()}>
                <FormWrapper>
                  <FormContainer>
                    <LogoWrapper>
                      <PFLogo pf={this.props.route.params.platform} />
                    </LogoWrapper>
                    {/* <InputLogin login={login} form={formModel} onChange={this.onChange('login')} /> */}
                    {authContext.passwordRegexI18n?.[I18n.getLanguage()] ? (
                      <AlertCard type="info" text={authContext.passwordRegexI18n[I18n.getLanguage()]} style={styles.alertCard} />
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
                        <TouchableOpacity onPress={() => this.doOpenCGU(cguUrl)}>
                          <SmallActionText>{I18n.get('auth-activation-cgu')}</SmallActionText>
                        </TouchableOpacity>
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

export default connect(
  (state: IGlobalState) => {
    return {
      legalUrls: getAuthState(state).legalUrls,
    };
  },
  dispatch => {
    const dprops = bindActionCreators<IActivationPageEventProps>(
      {
        trySubmit: tryAction(activateAccountAction),
      },
      dispatch,
    );
    return dprops;
  },
)(ActivationPage);
