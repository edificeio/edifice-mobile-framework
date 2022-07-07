// Libraries
import styled from '@emotion/native';
import I18n from 'i18n-js';
import * as React from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { KeyboardPageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { Text, TextBold, TextColorStyle, TextSizeStyle } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { openUrl } from '~/framework/util/linking';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { navigate } from '~/navigation/helpers/navHelper';
import { CommonStyles } from '~/styles/common/styles';
import { FlatButton } from '~/ui/FlatButton';
import { ErrorMessage } from '~/ui/Typography';
import { TextInputLine } from '~/ui/forms/TextInputLine';
import { Toggle } from '~/ui/forms/Toggle';
import { IVersionContext, checkVersionThenLogin, updateVersionIfWanted } from '~/user/actions/version';
import VersionModal from '~/user/components/VersionModal';
import { IUserAuthState } from '~/user/reducers/auth';
import { getAuthState } from '~/user/selectors';

// Props definition -------------------------------------------------------------------------------

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

// State definition -------------------------------------------------------------------------------

export interface ILoginPageState {
  login?: string;
  password?: string;
  typing: boolean;
  rememberMe: boolean;
}

const initialState: ILoginPageState = {
  login: undefined,
  password: undefined,
  typing: false,
  rememberMe: true,
};

// Main component ---------------------------------------------------------------------------------

const FormContainer = styled.View({
  alignItems: 'center',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  padding: UI_SIZES.spacing.large,
  paddingTop: UI_SIZES.spacing.huge,
});

export class LoginPage extends React.Component<ILoginPageProps, ILoginPageState> {
  // Refs
  private inputLogin: TextInput | null = null;
  private setInputLoginRef = (el: TextInput) => (this.inputLogin = el);

  private inputPassword: TextInput | null = null;
  private setInputPasswordRef = (el: TextInput) => (this.inputPassword = el);

  // Set default state
  constructor(props: ILoginPageProps) {
    super(props);
    this.state = initialState;
  }

  // Computed properties
  get isSubmitDisabled() {
    return !(this.state.login && this.state.password);
  }

  // Render

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

  protected renderLogo = () => {
    const logoStyle = { height: 50, width: 200 };
    if (DEPRECATED_getCurrentPlatform()!.logoStyle) {
      Object.assign(logoStyle, DEPRECATED_getCurrentPlatform()!.logoStyle!);
    }
    return (
      <View style={{ flexGrow: 2, alignItems: 'center', justifyContent: 'center' }}>
        <Picture
          type={DEPRECATED_getCurrentPlatform()!.logoType}
          source={DEPRECATED_getCurrentPlatform()!.logo}
          name={DEPRECATED_getCurrentPlatform()!.logo}
          style={logoStyle}
          resizeMode="contain"
        />
      </View>
    );
  };

  protected renderForm() {
    const { loggingIn, loggedIn, error, errtype } = this.props.auth;
    const { login, password, typing, rememberMe } = this.state;
    const FederationTextComponent = error ? TextBold : Text;
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
                backgroundColor: '#FCEEEA',
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
              <TextBold style={{ textAlign: 'center', color: theme.palette.status.failure }}>
                {I18n.t('common.sommeNumeriqueAlert_temp')}
              </TextBold>
            </View>
          ) : null}
          <FormContainer>
            {this.renderLogo()}
            <TextInputLine
              inputRef={this.setInputLoginRef}
              placeholder={I18n.t('Login')}
              onChangeText={(login: string) => this.setState({ login: login.trim().toLowerCase(), typing: true })}
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
              onChangeText={(password: string) => this.setState({ password, typing: true })}
              value={password}
              hasError={(error && !typing && !errtype) as boolean}
            />
            <View style={{ flexDirection: 'row', alignSelf: 'flex-end', marginTop: UI_SIZES.spacing.medium }}>
              <Text style={{ marginRight: UI_SIZES.spacing.small, ...TextColorStyle.Normal, ...TextSizeStyle.Small }}>
                {I18n.t('AutoLogin')}
              </Text>
              <Toggle
                checked={rememberMe}
                onCheck={() => this.setState({ rememberMe: true })}
                onUncheck={() => this.setState({ rememberMe: false })}
              />
            </View>
            <ErrorMessage style={errtype === 'warning' ? { color: theme.palette.status.warning } : {}}>
              {this.state.typing
                ? ''
                : error &&
                  I18n.t('auth-error-' + error, {
                    version: DeviceInfo.getVersion(),
                    errorcode: error,
                    currentplatform: DEPRECATED_getCurrentPlatform()!.url,
                  })}
            </ErrorMessage>

            <View
              style={{
                alignItems: 'center',
                flexGrow: 2,
                justifyContent: 'flex-start',
                marginTop: error && !typing ? UI_SIZES.spacing.small : UI_SIZES.spacing.medium,
              }}>
              {(error === 'not_premium' || error === 'pre_deleted') && !this.state.typing ? (
                <FlatButton
                  onPress={() => this.handleGoToWeb()}
                  disabled={false}
                  title={I18n.t('LoginWeb')}
                  loading={false}
                  rightName={{ type: 'NamedSvg', name: 'ui-externalLink' }}
                />
              ) : (
                <FlatButton
                  onPress={() => this.handleLogin()}
                  disabled={this.isSubmitDisabled || !this.props.connected}
                  title={I18n.t('Connect')}
                  loading={loggingIn || loggedIn}
                />
              )}

              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{ textDecorationLine: 'underline', marginTop: UI_SIZES.spacing.major, ...TextColorStyle.Light }}
                  onPress={() => {
                    navigate('Forgot', { forgotId: false });
                  }}>
                  {I18n.t('forgot-password')}
                </Text>
                <Text
                  style={{ textDecorationLine: 'underline', marginTop: UI_SIZES.spacing.medium, ...TextColorStyle.Light }}
                  onPress={() => {
                    navigate('Forgot', { forgotId: true });
                  }}>
                  {I18n.t('forgot-id')}
                </Text>
                {DEPRECATED_getCurrentPlatform()!.federation && (
                  <FederationTextComponent
                    style={{
                      textDecorationLine: 'underline',
                      marginTop: UI_SIZES.spacing.major,
                      textAlign: 'center',
                      color: error ? CommonStyles.profileTypes.Student : theme.ui.text.light,
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

  // Event handlers

  protected async handleLogin() {
    await this.props.onLogin(
      this.state.login || this.props.auth.login, // ToDo: fix this TS issue
      this.state.password,
      this.state.rememberMe,
    );
    this.setState({ typing: false });
  }

  protected handleGoToWeb() {
    openUrl(DEPRECATED_getCurrentPlatform()!.url);
  }

  // Other public methods

  public unfocus() {
    this.inputLogin && this.inputLogin.blur();
    this.inputPassword && this.inputPassword.blur();
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
