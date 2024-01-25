import CookieManager from '@react-native-cookies/cookies';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { ShouldStartLoadRequest, WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { PageView } from '~/framework/components/page';
import { PFLogo } from '~/framework/components/pfLogo';
import { SmallText } from '~/framework/components/text';
import { consumeAuthErrorAction, loginFederationAction } from '~/framework/modules/auth/actions';
import { IAuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { IAuthState, getState as getAuthState } from '~/framework/modules/auth/reducer';
import { navBarTitle } from '~/framework/navigation/navBar';
import { Error } from '~/framework/util/error';
import { Trackers } from '~/framework/util/tracker';
import { OAuthCustomTokens } from '~/infra/oauth';
import { Loading } from '~/ui/Loading';

enum WAYFPageMode {
  EMPTY = 0,
  ERROR = 1,
  LOADING = 2,
  SELECT = 3,
  WEBVIEW = 4,
}

export interface IWayfScreenProps extends NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.wayf> {
  auth: IAuthState;
  dispatch: ThunkDispatch<any, any, any>;
}

interface IWayfScreenState {
  // User selection dropdown opened?
  dropdownOpened: boolean;
  // Current display mode: Error Message | Loading Indicator | User Selection | WebView
  mode: WAYFPageMode;
  // error key as it functions in `useErrorWithKey`
  errkey: number;
}

// Styles sheet
const STYLES = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: UI_SIZES.spacing.large,
    paddingVertical: UI_SIZES.spacing.huge * 1.5,
  },
  // help: { marginTop: UI_SIZES.spacing.large, textAlign: 'center' },
  safeView: { flex: 1, backgroundColor: theme.ui.background.card },
  select: { borderColor: theme.palette.primary.regular, borderWidth: 1, marginTop: UI_SIZES.spacing.medium },
  selectBackDrop: { flex: 1 },
  selectContainer: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
    maxHeight: 120,
    marginTop: UI_SIZES.spacing.medium,
  },
  selectPlaceholder: { color: theme.ui.text.light },
  selectText: { color: theme.ui.text.light },
  text: { textAlign: 'center' },
  webview: { flex: 1 },
  errorMsg: {
    flexGrow: 0,
    marginTop: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
    alignSelf: 'center',
    color: theme.palette.status.failure.regular,
  },
  submitButton: {
    zIndex: -1,
  },
});

class WayfScreen extends React.Component<IWayfScreenProps, IWayfScreenState> {
  // Used to post HTML content and retrieve it via onMessage
  // Injected in WebView with injectedJavaScript property
  // Executed each time WebView url changes
  static get INJECTED_JS() {
    return 'ReactNativeWebView.postMessage(document.documentElement.innerHTML); true;';
  }

  // User selection dropdown items
  private dropdownItems: any = [];

  //  User selection dropdown selected value
  dropdownValue: string | null = null;

  // Auth url if defined
  private authUrl: string | undefined = undefined;

  // Error if any
  private error: Error.ErrorTypes<typeof Error.LoginError> | undefined;

  // Flag first webview page loading completion
  private isFirstLoadFinished = false;

  // Platform url
  private pfUrl: string | null = null;

  // SAMLResponse if any
  private samlResponse: string | undefined = undefined;

  // WAYF url
  private wayfUrl: string | undefined = undefined;

  // WebView reference management
  private webview?: WebView;

  private setWebView(ref: WebView) {
    this.webview = ref;
  }

  // Is WebView back history empty?
  private webviewCanGoBack = false;

  // Navbar back handlers
  private backActions = [
    // WAYFPageMode.EMPTY: Go to top of wayf navigation stack
    () => {
      this.props.navigation.navigate(authRouteNames.loginWayf, { platform: this.props.route.params.platform });
    },
    // WAYFPageMode.ERROR: Go to top of wayf navigation stack
    () => {
      this.props.navigation.navigate(authRouteNames.loginWayf, { platform: this.props.route.params.platform });
    },
    // WAYFPageMode.LOADING: Nothing to do
    () => {},
    // case WAYFPageMode.SELECT: Go back to WebView mode
    () => {
      this.displayWebview();
    },
    // case WAYFPageMode.WEBVIEW: Go back through WebView history if possible otherwise go back through navigation stack
    () => {
      if (this.webviewCanGoBack) this.webview?.goBack();
      else this.clearDatas(() => this.props.navigation.goBack());
    },
  ];

  // Content components
  private contentComponents = [
    // WAYFPageMode.EMPTY: Display empty screen
    () => {
      Trackers.trackDebugEvent('Auth', 'WAYF', `ERROR: ${this.error}`);
      return (
        <EmptyScreen svgImage="empty-content" text={I18n.get('auth-wayf-empty-text')} title={I18n.get('auth-wayf-empty-title')} />
      );
    },
    // WAYFPageMode.ERROR: Display error message
    () => {
      Trackers.trackDebugEvent('Auth', 'WAYF', `ERROR: ${this.error}`);
      return (
        <View style={STYLES.container}>
          <PFLogo pf={this.props.route.params.platform} />
          <SmallText style={STYLES.errorMsg}>
            {this.error ? Error.getAuthErrorText<typeof Error.LoginError>(this.error) : ''}
          </SmallText>
          <PrimaryButton text={I18n.get('auth-wayf-error-retry')} action={() => this.displayWebview()} />
        </View>
      );
    },
    // WAYFPageMode.LOADING: Display loading indicator
    () => {
      Trackers.trackDebugEvent('Auth', 'WAYF', 'LOADING');
      return (
        <View style={STYLES.container}>
          <PFLogo pf={this.props.route.params.platform} />
          <SmallText style={STYLES.text}>{I18n.get('auth-wayf-loading-text')}</SmallText>
          <ActivityIndicator size="large" color={theme.palette.primary.regular} />
        </View>
      );
    },
    // case WAYFPageMode.SELECT: Display user selection
    (dropdownOpened: boolean) => {
      Trackers.trackDebugEvent('Auth', 'WAYF', 'SELECT');
      return (
        <TouchableWithoutFeedback
          style={STYLES.selectBackDrop}
          onPress={() => {
            this.setState({ dropdownOpened: false });
          }}>
          <View style={STYLES.container}>
            <SmallText style={STYLES.text}>{I18n.get('auth-wayf-select-text')}</SmallText>
            <DropDownPicker
              dropDownContainerStyle={STYLES.selectContainer}
              items={this.dropdownItems}
              open={this.state.dropdownOpened}
              placeholder={I18n.get('auth-wayf-select-placeholder')}
              placeholderStyle={STYLES.selectPlaceholder}
              setOpen={() =>
                this.setState({
                  dropdownOpened: !dropdownOpened,
                })
              }
              setValue={callback => (this.dropdownValue = callback({}))}
              showTickIcon={false}
              style={STYLES.select}
              textStyle={STYLES.selectText}
              value={this.dropdownValue}
            />
            <View style={STYLES.submitButton}>
              <PrimaryButton
                text={I18n.get('auth-wayf-select-button')}
                disabled={this.dropdownValue === null}
                action={() => this.loginWithCustomToken()}
              />
              {/*<Small style={WAYFPage.STYLES.help}>{I18n.get('auth-wayf-select-help')}</Small>*/}
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    },
    // case WAYFPageMode.WEBVIEW: Display WebView
    () => {
      Trackers.trackDebugEvent('Auth', 'WAYF', 'WEBVIEW');
      return (
        <WebView
          ref={(ref: WebView) => this.setWebView(ref)}
          injectedJavaScript={WayfScreen.INJECTED_JS}
          javaScriptEnabled
          onError={this.onError.bind(this)}
          onHttpError={this.onHttpError.bind(this)}
          onLoad={this.onLoad.bind(this)}
          onLoadStart={this.onLoadStart.bind(this)}
          onMessage={this.onMessage.bind(this)}
          onNavigationStateChange={this.onNavigationStateChange.bind(this)}
          onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest.bind(this)}
          renderLoading={() => <Loading />}
          scalesPageToFit
          showsHorizontalScrollIndicator={false}
          source={{ uri: this.wayfUrl!, headers: { 'X-APP': 'mobile' } }}
          setSupportMultipleWindows={false}
          startInLoadingState
          style={STYLES.webview}
        />
      );
    },
  ];

  constructor(props: IWayfScreenProps) {
    super(props);
    const pfConf = this.props.route.params.platform;
    this.authUrl = pfConf?.auth;
    this.pfUrl = pfConf?.url;
    this.wayfUrl = pfConf?.wayf;
    this.state = { dropdownOpened: false, mode: WAYFPageMode.WEBVIEW, errkey: Error.generateErrorKey() };
    this.backActions.forEach(action => {
      action.bind(this);
    });
    CookieManager.clearAll(true);
  }

  componentDidUpdate(prevProps: IWayfScreenProps) {
    const { auth } = this.props;
    const errorType = Error.getDeepErrorType<typeof Error.LoginError>(auth.error);
    // Detect && display potential login error sent after checkVersionThenLogin(false) call
    if (
      (auth.error?.key === undefined || auth.error.key === this.state.errkey) &&
      errorType?.length &&
      errorType?.length > 0 &&
      errorType !== this.error &&
      errorType !== Error.OAuth2ErrorType.SAML_MULTIPLE_VECTOR
    ) {
      this.displayError(errorType);
    }
    // Update page title
    this.props.navigation.setOptions({
      headerTitle: navBarTitle(
        I18n.get(this.state.mode === WAYFPageMode.SELECT ? 'auth-wayf-select-title' : 'auth-wayf-main-title'),
      ),
    });
  }

  // Clear datas (WebView cookies, etc.) and execute given callback when done
  clearDatas(callback: Function) {
    const { navigation } = this.props;
    // Clear cookies
    CookieManager.clearAll(true)
      .then(_success => {
        // Clear some stuff
        this.error = undefined;
        this.dropdownItems = [];
        this.dropdownValue = null;
        this.samlResponse = undefined;
        // Execute given callack
        callback();
      })
      .catch(_error => {
        // Go to WAYF stack home
        navigation.navigate(authRouteNames.loginWayf, { platform: this.props.route.params.platform });
      });
  }

  // Display empty screen
  displayEmpty() {
    this.clearDatas(() => {
      this.setState({ mode: WAYFPageMode.EMPTY });
    });
  }

  // Display error message
  displayError(error: Error.ErrorTypes<typeof Error.LoginError>) {
    this.clearDatas(() => {
      this.error = error === Error.OAuth2ErrorType.CREDENTIALS_MISMATCH ? Error.OAuth2ErrorType.SAML_INVALID : error;
      this.setState({ mode: WAYFPageMode.ERROR });
      if (this.state.errkey === undefined) this.props.dispatch(consumeAuthErrorAction(this.state.errkey));
    });
  }

  // Display loading
  displayLoading() {
    this.setState({ mode: WAYFPageMode.LOADING });
  }

  // Display user selection
  displaySelect() {
    this.setState({ mode: WAYFPageMode.SELECT });
  }

  // Display WebView
  displayWebview() {
    // Clear cookies and then go to WebView mode
    this.clearDatas(() => this.setState({ dropdownOpened: false, mode: WAYFPageMode.WEBVIEW }));
  }

  // Login with obtained saml assertion
  loginWithSaml() {
    const saml = this.samlResponse;
    this.clearDatas(async () => {
      if (!saml) return;
      Trackers.trackDebugEvent('Auth', 'WAYF', 'SAML');
      this.displayLoading();
      try {
        await this.props.dispatch(loginFederationAction(this.props.route.params.platform, { saml }, this.state.errkey));
      } catch (error) {
        const errtype = Error.getDeepErrorType<typeof Error.LoginError>(error as Error);
        if (error instanceof Error.SamlMultipleVectorError && errtype === Error.OAuth2ErrorType.SAML_MULTIPLE_VECTOR) {
          try {
            // Extract users from error description

            (error.data.users as OAuthCustomTokens).forEach(token => {
              this.dropdownItems.push({ label: token.structureName, value: token.key });
            });
            this.setState({ errkey: Error.generateErrorKey() }); // clear error
            this.displaySelect();
            return;
          } catch (e) {
            // Malformed multiple users error description
            this.displayError(Error.FetchErrorType.BAD_RESPONSE);
          }
        }
        if (errtype) {
          this.displayError(errtype);
        }
      } finally {
        this.samlResponse = undefined;
      }
    });
  }

  // Login with selected token
  async loginWithCustomToken() {
    if (!this.dropdownValue) return;
    Trackers.trackDebugEvent('Auth', 'WAYF', 'CUSTOM_TOKEN');
    this.displayLoading();
    try {
      await this.props.dispatch(
        loginFederationAction(this.props.route.params.platform, { customToken: this.dropdownValue }, this.state.errkey),
      );
    } catch (error) {
      const errtype = Error.getDeepErrorType<typeof Error.LoginError>(error as Error);
      if (errtype) {
        this.displayError(errtype);
      }
    }
  }

  // Navbar back handler
  onBack(mode: WAYFPageMode) {
    this.backActions[mode]();
  }

  // Called each time a navigation error occurs in WebView
  // See WebView onError property
  onError(event) {
    if (__DEV__) console.debug('WAYFScreen::onError => ', event.nativeEvent);
    // Display empty screen
    this.displayEmpty();
  }

  // Called each time an http error occurs in WebView
  // See WebView onError property
  onHttpError(event) {
    if (__DEV__) console.debug('WAYFScreen::onHttpError => ', event.nativeEvent.statusCode);
    // Display empty screen
    this.displayEmpty();
  }

  onLoad() {
    // Flag first webview page loading completion
    this.isFirstLoadFinished = true;
  }

  onLoadStart() {
    setTimeout(() => {
      if (!this.isFirstLoadFinished) {
        this.error = Error.FetchErrorType.TIMEOUT;
        this.setState({ mode: WAYFPageMode.ERROR });
      }
    }, 20000);
  }

  // Called each time POST_HTML_CONTENT js code is executed (e.g when WebView url changes)
  // See WebView onMessage property
  onMessage(event: WebViewMessageEvent) {
    // Get HTML code
    const innerHTML = event?.nativeEvent?.data || '';
    /*if (__DEV__) {
      console.debug('innerHTML : ');
      console.debug(innerHTML);
    }*/
    // Retrieve potential SAML token (Stored in <input type="hidden" name="SAMLResponse" value="[saml]"/>)
    const components = innerHTML.split('name="SAMLResponse" value="');
    if (components?.length === 2) {
      const index = components[1].indexOf('"');
      // Call oauth2 token api with received SAML if any
      if (index > 0) this.samlResponse = components[1].substring(0, index);
      if (this.samlResponse) this.loginWithSaml();
    }
  }

  // Called each time WebView navigation state changes
  // See WebView onNavigationStateChange property
  onNavigationStateChange(navigationState: WebViewNavigation) {
    // Update WebView back history flag
    this.webviewCanGoBack = navigationState.canGoBack;
    // Track new url
    Trackers.trackDebugEvent('Auth', 'WAYF', navigationState.url);
  }

  // Called each time WebView url is about to change
  // Must return true|false to allow|avoid navigation
  // See WebView onNavigationStateChange property
  onShouldStartLoadWithRequest(request: ShouldStartLoadRequest) {
    const url = request.url;
    if (__DEV__) {
      console.debug('WAYFScreen::onShouldStartLoadWithRequest: isFirstLoadFinished = ', this.isFirstLoadFinished);
      console.debug('WAYFScreen::onShouldStartLoadWithRequest: url = ', url);
    }
    // If current url is outside the WAYF
    if (this.wayfUrl && this.isFirstLoadFinished && !url.startsWith(this.wayfUrl)) {
      // Allow navigation to SP-Initiated WAYFs via auth config field
      if (this.authUrl && url.startsWith(this.authUrl)) {
        if (__DEV__) console.debug('WAYFScreen::onShouldStartLoadWithRequest: authUrl received => Navigation allowed');
        return true;
      }
      // Go to standard login page and block navigation when
      //   - No SAMLResponse has been detected
      //   - WAYF redirects to ENT
      if (this.pfUrl && url.startsWith(this.pfUrl)) {
        if (!this.samlResponse) {
          if (__DEV__) console.debug('WAYFScreen::onShouldStartLoadWithRequest: pfUrl received => Will show login page');
          this.props.navigation.replace(authRouteNames.loginCredentials, { platform: this.props.route.params.platform });
        }
        return false;
      }
    }
    // Allow navigation
    if (__DEV__) console.debug('WAYFScreen::onShouldStartLoadWithRequest: Navigation allowed');
    return true;
  }

  public render() {
    const { dropdownOpened, mode } = this.state;
    return (
      <PageView>
        <SafeAreaView style={STYLES.safeView}>{this.contentComponents[mode](dropdownOpened)}</SafeAreaView>
      </PageView>
    );
  }
}

export default connect((state: any, props: any) => {
  return {
    auth: getAuthState(state),
  };
})(WayfScreen);
