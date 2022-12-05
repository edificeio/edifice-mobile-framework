import styled from '@emotion/native';
import I18n from 'i18n-js';
import * as React from 'react';
import { InteractionManager, Platform, ScrollView, TextInput, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/action-button';
import { UI_SIZES } from '~/framework/components/constants';
import { KeyboardPageView } from '~/framework/components/page';
import { PFLogo } from '~/framework/components/pfLogo';
import { CaptionText, SmallBoldText, SmallText } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { navigate } from '~/navigation/helpers/navHelper';
import { TextInputLine } from '~/ui/forms/TextInputLine';
import { Toggle } from '~/ui/forms/Toggle';
import { IVersionContext, checkVersionThenLogin, updateVersionIfWanted } from '~/user/actions/version';
import VersionModal from '~/user/components/VersionModal';
import { IUserAuthState } from '~/user/reducers/auth';
import { getAuthState } from '~/user/selectors';

export interface ILoginPageDataProps {
  auth: IUserAuthState;
  headerHeight: number;
  // version
  versionContext: IVersionContext | null;
  versionModal: boolean;
  version: string;
  versionMandatory: boolean;
  // connection
  connected: boolean;
}

export interface ILoginPageEventProps {
  onSkipVersion(versionContext: IVersionContext): void;
  onUpdateVersion(versionContext: IVersionContext): void;
  onLogin(userlogin: string, password: string, rememberMe: boolean): void;
}

export interface ILoginPageOtherProps {
  navigation?: any;
}

export type ILoginPageProps = ILoginPageDataProps & ILoginPageEventProps & ILoginPageOtherProps;

export interface ILoginPageState {
  login?: string;
  password?: string;
  typing: boolean;
  rememberMe: boolean;
  isLoggingIn: boolean;
}

const initialState: ILoginPageState = {
  login: undefined,
  password: undefined,
  typing: false,
  rememberMe: true,
  isLoggingIn: false,
};

const FormContainer = styled.View({
  alignItems: 'center',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  padding: UI_SIZES.spacing.large,
  paddingTop: UI_SIZES.spacing.huge,
});

export class LoginPage extends React.Component<ILoginPageProps, ILoginPageState> {
  private inputLogin: TextInput | null = null;

  private setInputLoginRef = (el: TextInput) => (this.inputLogin = el);

  private inputPassword: TextInput | null = null;

  private setInputPasswordRef = (el: TextInput) => (this.inputPassword = el);

  constructor(props: ILoginPageProps) {
    super(props);
    this.state = initialState;
  }

  changeLogin(login: string) {
    this.setState({ login: login.trim().toLowerCase(), typing: true });
  }

  protected async handleLogin() {
    this.setState({ isLoggingIn: true });
    await this.props.onLogin(
      this.state.login || this.props.auth.login, // ToDo: fix this TS issue
      this.state.password,
      this.state.rememberMe,
    );
    this.setState({ typing: false });
  }

  handleLoginChanged(login: string) {
    if (Platform.OS === 'ios') this.changeLogin(login);
    else
      InteractionManager.runAfterInteractions(() => {
        this.changeLogin(login);
      });
  }

  handlePasswordChanged(password: string) {
    this.setState({ password, typing: true });
  }

  get isSubmitDisabled() {
    return !(this.state.login && this.state.password);
  }

  public unfocus() {
    this.inputLogin && this.inputLogin.blur();
    this.inputPassword && this.inputPassword.blur();
  }

  protected renderForm() {
    const { error, errtype } = this.props.auth;
    const { login, password, typing, rememberMe, isLoggingIn } = this.state;
    const FederationTextComponent = error ? SmallBoldText : SmallText;
    const isSommeNumerique = DEPRECATED_getCurrentPlatform()!.displayName === 'Somme numérique'; // WTF ??!! 🤪🤪🤪

    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          alwaysBounceVertical={false}
          overScrollMode="never"
          contentContainerStyle={{ flexGrow: 1 }}>
          {/* Temporary banner displayed for Somme Numérique */}
          {isSommeNumerique ? (
            <View
              style={{
                backgroundColor: theme.palette.complementary.red.pale,
                justifyContent: 'center',
                alignItems: 'center',
                padding: UI_SIZES.spacing.minor,
                borderColor: theme.palette.status.failure,
                borderWidth: 1,
                borderRadius: 15,
                width: '90%',
                alignSelf: 'center',
                position: 'absolute',
              }}>
              <SmallBoldText style={{ textAlign: 'center', color: theme.palette.status.failure }}>
                {I18n.t('common.sommeNumeriqueAlert_temp')}
              </SmallBoldText>
            </View>
          ) : null}
          <FormContainer>
            {this.renderLogo()}
            <TextInputLine
              inputRef={this.setInputLoginRef}
              placeholder={I18n.t('Login')}
              onChangeText={this.handleLoginChanged.bind(this)}
              value={login}
              hasError={(error && !typing && !errtype) as boolean}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
            <TextInputLine
              isPasswordField
              inputRef={this.setInputPasswordRef}
              placeholder={I18n.t('Password')}
              onChangeText={this.handlePasswordChanged.bind(this)}
              value={password}
              hasError={(error && !typing && !errtype) as boolean}
            />
            <View style={{ flexDirection: 'row', alignSelf: 'flex-end', marginTop: UI_SIZES.spacing.medium }}>
              <CaptionText style={{ marginRight: UI_SIZES.spacing.small }}>{I18n.t('AutoLogin')}</CaptionText>
              <Toggle
                checked={rememberMe}
                onCheck={() => this.setState({ rememberMe: true })}
                onUncheck={() => this.setState({ rememberMe: false })}
              />
            </View>
            <SmallText
              style={{
                flexGrow: 0,
                marginTop: UI_SIZES.spacing.medium,
                padding: UI_SIZES.spacing.tiny,
                textAlign: 'center',
                alignSelf: 'center',
                color: errtype === 'warning' ? theme.palette.status.warning : theme.palette.status.failure,
              }}>
              {this.state.typing
                ? ''
                : error &&
                  I18n.t('auth-error-' + error, {
                    version: DeviceInfo.getVersion(),
                    errorcode: error,
                    currentplatform: DEPRECATED_getCurrentPlatform()!.url,
                  })}
            </SmallText>

            <View
              style={{
                alignItems: 'center',
                flexGrow: 2,
                justifyContent: 'flex-start',
                marginTop: error && !typing ? UI_SIZES.spacing.small : UI_SIZES.spacing.medium,
              }}>
              {(error === 'not_premium' || error === 'pre_deleted') && !this.state.typing ? (
                <ActionButton text={I18n.t('LoginWeb')} url="/" />
              ) : (
                <ActionButton
                  text={I18n.t('Connect')}
                  disabled={this.isSubmitDisabled || !this.props.connected}
                  action={() => this.handleLogin()}
                  loading={isLoggingIn && !error}
                />
              )}
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <SmallText
                  style={{ textDecorationLine: 'underline', marginTop: UI_SIZES.spacing.major, color: theme.ui.text.light }}
                  onPress={() => {
                    navigate('Forgot', { forgotId: false });
                  }}>
                  {I18n.t('forgot-password')}
                </SmallText>
                <SmallText
                  style={{ textDecorationLine: 'underline', marginTop: UI_SIZES.spacing.medium, color: theme.ui.text.light }}
                  onPress={() => {
                    navigate('Forgot', { forgotId: true });
                  }}>
                  {I18n.t('forgot-id')}
                </SmallText>
                {DEPRECATED_getCurrentPlatform()!.federation && (
                  <FederationTextComponent
                    style={{
                      textDecorationLine: 'underline',
                      marginTop: UI_SIZES.spacing.major,
                      textAlign: 'center',
                      color: error ? theme.palette.complementary.orange.regular : theme.ui.text.light,
                    }}
                    onPress={() => {
                      navigate('FederatedAccount');
                    }}>
                    {I18n.t('federatedAccount-link')}
                  </FederationTextComponent>
                )}
              </View>
            </View>
          </FormContainer>
        </ScrollView>
      </View>
    );
  }

  protected renderLogo = () => {
    return (
      <View style={{ flexGrow: 2, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <PFLogo />
      </View>
    );
  };

  public render() {
    const { versionContext, versionMandatory, versionModal, version, onSkipVersion, onUpdateVersion, navigation } = this.props;
    const platformDisplayName = DEPRECATED_getCurrentPlatform()!.displayName;

    return (
      <KeyboardPageView
        navigation={navigation}
        navBarWithBack={{ title: platformDisplayName }}
        style={{ backgroundColor: theme.ui.background.card }}>
        <VersionModal
          mandatory={versionMandatory}
          version={version}
          visibility={versionModal}
          onCancel={() => versionContext && onSkipVersion(versionContext)}
          onSubmit={() => versionContext && onUpdateVersion(versionContext)}
        />
        {this.renderForm()}
      </KeyboardPageView>
    );
  }
}

const ConnectedLoginPage = connect(
  (state: any, props: any): ILoginPageDataProps => {
    const auth: IUserAuthState = getAuthState(state);
    let version = '',
      versionModal = false,
      versionMandatory = false,
      versionContext: IVersionContext | null = null;
    if (auth.versionContext && auth.versionContext.version) {
      versionContext = auth.versionContext;
      version = versionContext.version.newVersion;
      versionModal = true;
      versionMandatory = !versionContext.version.canContinue;
    }
    return {
      auth,
      headerHeight: state.ui.headerHeight,
      versionMandatory,
      version,
      versionModal,
      versionContext,
      connected: !!state.connectionTracker.connected,
    };
  },
  (dispatch): ILoginPageEventProps => ({
    onSkipVersion: version => {
      dispatch<any>(updateVersionIfWanted(version, false));
    },
    onUpdateVersion: version => {
      dispatch<any>(updateVersionIfWanted(version, true));
    },
    onLogin: (userlogin, password, rememberMe) => {
      dispatch<any>(checkVersionThenLogin(false, { username: userlogin, password, rememberMe }));
    },
  }),
)(LoginPage);

export default withViewTracking('auth/login')(ConnectedLoginPage);
