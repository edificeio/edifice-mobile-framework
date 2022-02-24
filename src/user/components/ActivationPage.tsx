import style from 'glamorous-native';
import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';

import {
  ActivationFormModel,
  InputEmail,
  InputLogin,
  InputPassword,
  InputPasswordConfirm,
  InputPhone,
  ValueChangeArgs,
} from './ActivationForm';

import { BackdropPdfReader } from '~/framework/components/backdropPdfReader';
import { Checkbox } from '~/framework/components/checkbox';
import { HeaderBackAction } from '~/framework/components/header';
import { PFLogo } from '~/framework/components/pfLogo';
import { Text, TextAction } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { Trackers } from '~/framework/util/tracker';
import { FlatButton, Loading } from '~/ui';
import { ErrorMessage } from '~/ui/Typography';
import { IActivationModel, IActivationUserInfo } from '~/user/actions/activation';
import { ContextState, SubmitState } from '~/utils/SubmitState';
import { PageView } from '~/framework/components/page';

// TYPES ---------------------------------------------------------------------------

type IFields = 'login' | 'password' | 'confirm' | 'phone' | 'email';

export interface IActivationPageState extends IActivationModel {
  typing: boolean;
  isCGUAccepted: boolean;
  isModalVisible: boolean;
}
export interface IActivationPageDataProps extends IActivationModel {
  passwordRegex: string;
  emailRequired: boolean;
  phoneRequired: boolean;
  externalError: string;
  contextState: ContextState;
  submitState: SubmitState;
  navigation: any;
}
export interface IActivationPageEventProps {
  onSubmit(model: IActivationModel): Promise<void>;
  onRetryLoad: (args: IActivationUserInfo) => void;
  onCancelLoad: () => void;
}
export type IActivationPageProps = IActivationPageDataProps & IActivationPageEventProps;
// Activation Page Component -------------------------------------------------------------

export class ActivationPage extends React.PureComponent<IActivationPageProps, IActivationPageState> {
  // fully controller component
  public state: IActivationPageState = {
    ...this.props,
    typing: false,
    isCGUAccepted: false,
    isModalVisible: false,
  };
  private handleActivation = async () => {
    this.props.onSubmit({ ...this.state });
    this.setState({ typing: false });
  };
  private onChange = (key: IFields) => {
    return (valueChange: ValueChangeArgs<string>) => {
      const newState: Partial<IActivationPageState> = {
        [key]: valueChange.value,
        typing: true,
      };
      this.setState(newState as any);
    };
  };
  private handleOpenCGU = () => {
    this.setState({ isModalVisible: true });
    Trackers.trackEvent('Auth', 'READ NOTICE', 'cgu');
  };

  public componentDidMount() {
    const props = this.props;
    if (this.props.contextState == ContextState.Failed) {
      Alert.alert(I18n.t('ErrorNetwork'), I18n.t('activation-errorLoading'), [
        {
          text: I18n.t('activation-retryLoad'),
          onPress() {
            props.onRetryLoad({
              activationCode: props.activationCode,
              login: props.login,
            });
          },
          style: 'default',
        },
        {
          text: I18n.t('activation-cancelLoad'),
          onPress() {
            props.onCancelLoad();
          },
          style: 'cancel',
        },
      ]);
    }
  }

  public render() {
    const { externalError, contextState, submitState, navigation } = this.props;
    const { login, password, confirm, email, phone, isCGUAccepted, isModalVisible, typing } = this.state;
    if (contextState == ContextState.Loading || contextState == ContextState.Failed) {
      return <Loading />;
    }
    const formModel = new ActivationFormModel({
      ...this.props,
      password: () => password,
    });
    const isNotValid = !isCGUAccepted || !formModel.validate({ ...this.state });
    const errorKey = formModel.firstErrorKey({ ...this.state });
    const errorText = errorKey ? I18n.t(errorKey) : externalError;
    const hasErrorKey = !!errorText;
    const isSubmitLoading = submitState == SubmitState.Loading;
    const platform = DEPRECATED_getCurrentPlatform()!.url;
    const path = I18n.t('common.url.cgu');
    const cguUrl = `${platform}${path}`;

    const navBarInfo = {
      left: <HeaderBackAction navigation={navigation} />,
      title: I18n.t('activation-title'),
    };

    return (
      <PageView path={navigation.state.routeName} navBar={navBarInfo}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#ffffff' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView alwaysBounceVertical={false} contentContainerStyle={{ flexGrow: 1 }}>
              <FormTouchable onPress={() => formModel.blur()}>
                <FormWrapper>
                  <FormContainer>
                    <LogoWrapper>
                      <PFLogo />
                    </LogoWrapper>
                    <InputLogin login={login} form={formModel} onChange={this.onChange('login')} />
                    <InputPassword password={password} form={formModel} onChange={this.onChange('password')} />
                    <InputPasswordConfirm confirm={confirm} form={formModel} onChange={this.onChange('confirm')} />
                    <InputEmail email={email} form={formModel} onChange={this.onChange('email')} />
                    <InputPhone phone={phone} form={formModel} onChange={this.onChange('phone')} />
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        alignSelf: 'stretch',
                        marginTop: 30,
                      }}>
                      <Checkbox
                        checked={isCGUAccepted}
                        onPress={() => this.setState({ isCGUAccepted: !isCGUAccepted })}
                        customContainerStyle={{ marginRight: 5 }}
                      />
                      <Text>{I18n.t('activation-cgu-accept')}</Text>
                      <TouchableOpacity onPress={this.handleOpenCGU}>
                        <TextAction>{I18n.t('activation-cgu')}</TextAction>
                      </TouchableOpacity>
                    </View>
                    <ErrorMessage> {hasErrorKey && !typing ? errorText : ''} </ErrorMessage>
                    <ButtonWrapper error={hasErrorKey} typing={typing}>
                      <FlatButton
                        onPress={() => this.handleActivation()}
                        disabled={isNotValid}
                        title={I18n.t('Activate')}
                        loading={isSubmitLoading}
                      />
                    </ButtonWrapper>
                  </FormContainer>
                </FormWrapper>
              </FormTouchable>
            </ScrollView>
          </KeyboardAvoidingView>
          <BackdropPdfReader
            handleClose={() => this.setState({ isModalVisible: false })}
            handleOpen={() => this.setState({ isModalVisible: true })}
            title={I18n.t('activation-cgu')}
            uri={cguUrl}
            visible={isModalVisible}
          />
        </SafeAreaView>
      </PageView>
    );
  }
}

const FormPage = style.view({
  backgroundColor: '#ffffff',
  flex: 1,
});
const FormTouchable = style.touchableWithoutFeedback({ flex: 1 });
const FormWrapper = style.view({ flex: 1 });
const FormContainer = style.view({
  alignItems: 'center',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  padding: 40,
  paddingTop: 60,
});
const LogoWrapper = style.view({
  flexGrow: 2,
  alignItems: 'center',
  justifyContent: 'center',
});
const ButtonWrapper = style.view(
  {
    alignItems: 'center',
    flexGrow: 2,
    justifyContent: 'flex-start',
  },
  ({ error, typing }) => ({
    marginTop: error && !typing ? 10 : 10,
  }),
);
