import CookieManager from '@react-native-cookies/cookies';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import DropDownPicker from 'react-native-dropdown-picker';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
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
import { consumeAuthError, loginAction } from '~/framework/modules/auth/actions';
import { IAuthNavigationParams, authRouteNames, redirectLoginNavAction } from '~/framework/modules/auth/navigation';
import { IAuthState, getState as getAuthState } from '~/framework/modules/auth/reducer';
import { navBarTitle } from '~/framework/navigation/navBar';
import { Trackers } from '~/framework/util/tracker';
import { IOAuthToken, OAuth2ErrorCode, OAuth2RessourceOwnerPasswordClient, OAuthCustomTokens, initOAuth2 } from '~/infra/oauth';
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
  select: { borderColor: theme.palette.primary.regular, borderWidth: 1 },
  selectBackDrop: { flex: 1 },
  selectContainer: { borderColor: theme.palette.primary.regular, borderWidth: 1, maxHeight: 120 },
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
  static get POST_HTML_CONTENT() {
    return 'ReactNativeWebView.postMessage(document.documentElement.innerHTML); true;';
  }

  // User selection dropdown items
  private dropdownItems: any = [];

  //  User selection dropdown selected value
  dropdownValue: string | null = null;

  // Error if any
  private error: string = '';

  // Flag first webview page loading completion
  private isFirstLoadFinished = false;

  // Platform url
  private pfUrl: string = '';

  // SAMLResponse if any
  private samlResponse: string | null = null;

  // WAYF url
  private wayfUrl: string = '';

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
            {this.error
              ? I18n.get('auth-error-' + this.error.replaceAll('_', ''), {
                  version: DeviceInfo.getVersion(),
                  errorcode: this.error,
                  currentplatform: this.props.route.params.platform.url,
                  defaultValue: I18n.get('auth-error-other', {
                    version: DeviceInfo.getVersion(),
                    errorcode: this.error,
                    currentplatform: this.props.route.params.platform.url,
                  }),
                })
              : ''}
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
          injectedJavaScript={WayfScreen.POST_HTML_CONTENT}
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
          source={{ uri: this.wayfUrl }}
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
    this.pfUrl = pfConf?.url || '';
    this.wayfUrl = pfConf?.wayf || '';
    this.state = { dropdownOpened: false, mode: WAYFPageMode.WEBVIEW };
    this.backActions.forEach(action => {
      action.bind(this);
    });
  }

  componentDidUpdate(prevProps: IWayfScreenProps) {
    const { auth } = this.props;
    // Detect && display potential login error sent after checkVersionThenLogin(false) call
    if (auth?.error?.length && auth?.error?.length > 0 && auth.error !== this.error) {
      this.displayError(auth.error);
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
        this.error = '';
        this.dropdownItems = [];
        this.dropdownValue = null;
        this.samlResponse = null;
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
  displayError(error: string) {
    this.clearDatas(() => {
      this.error = error === OAuth2ErrorCode.BAD_CREDENTIALS ? OAuth2ErrorCode.BAD_SAML : error;
      this.setState({ mode: WAYFPageMode.ERROR });
      this.props.dispatch(consumeAuthError());
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

  // Get oAuth token with received SAML response
  getOAuthToken() {
    Trackers.trackDebugEvent('Auth', 'WAYF', 'SAML');
    this.displayLoading();
    // Call oauth2 token api
    initOAuth2(this.props.route.params.platform);
    OAuth2RessourceOwnerPasswordClient.connection
      ?.getNewTokenWithSAML(this.samlResponse!)
      .then(data => {
        // Manage unique user, otherwise send error
        if ((data as IOAuthToken).access_token) {
          this.login();
        } else {
          const error = OAuth2RessourceOwnerPasswordClient.connection?.createAuthError(
            OAuth2ErrorCode.BAD_RESPONSE,
            'no access_token returned',
            '',
            { data },
          ) as Error;
          throw error;
        }
      })
      .catch(error => {
        // Manage multiple users, otherwise display received error
        if (error.error === OAuth2ErrorCode.MULTIPLE_VECTOR) {
          try {
            // Extract users from error description
            const data = JSON.parse(error.error_description);
            (data.users as OAuthCustomTokens).forEach(token => {
              this.dropdownItems.push({ label: token.structureName, value: token.key });
            });
            // Display users selection
            this.displaySelect();
          } catch {
            // Malformed multiple users error description
            this.displayError(OAuth2ErrorCode.BAD_RESPONSE);
          }
        } else this.displayError(error.type);
      });
  }

  // Login with current oAuth token
  login() {
    this.clearDatas(async () => {
      Trackers.trackDebugEvent('Auth', 'WAYF', 'LOGIN');
      this.displayLoading();
      this.samlResponse = null;
      try {
        const redirect = await this.props.dispatch(loginAction(this.props.route.params.platform));
        if (redirect) {
          redirectLoginNavAction(redirect, this.props.route.params.platform, this.props.navigation);
        }
      } catch {
        // TODO: handle error
      }
    });
  }

  // Login with selected token
  loginWithCustomToken() {
    Trackers.trackDebugEvent('Auth', 'WAYF', 'CUSTOM_TOKEN');
    this.displayLoading();
    // Call oauth2 token api with selected custom token
    if (this.dropdownValue)
      OAuth2RessourceOwnerPasswordClient.connection
        ?.getNewTokenWithCustomToken(this.dropdownValue)
        .then(data => {
          // Manage unique user, otherwise send error
          if ((data as IOAuthToken).access_token) {
            this.login();
          } else {
            const error = OAuth2RessourceOwnerPasswordClient.connection?.createAuthError(
              OAuth2ErrorCode.BAD_RESPONSE,
              'no access_token returned',
              '',
              { data },
            ) as Error;
            throw error;
          }
        })
        .catch(error => {
          this.displayError(error.type);
        });
  }

  // Navbar back handler
  onBack(mode: WAYFPageMode) {
    this.backActions[mode]();
  }

  // Called each time a navigation error occurs in WebView
  // See WebView onError property
  onError() {
    // Display empty screen
    this.displayEmpty();
  }

  // Called each time an http error occurs in WebView
  // See WebView onError property
  onHttpError() {
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
        this.error = 'wayftoolong';
        this.setState({ mode: WAYFPageMode.ERROR });
      }
    }, 20000);
  }

  // Called each time POST_HTML_CONTENT js code is executed (e.g when WebView url changes)
  // See WebView onMessage property
  onMessage(event: WebViewMessageEvent) {
    // Get HTML code
    const innerHTML = event?.nativeEvent?.data || '';
    // Retrieve potential SAML token (Stored in <input type="hidden" name="SAMLResponse" value="[saml]"/>)
    const components = innerHTML.split('name="SAMLResponse" value="');
    if (components?.length === 2) {
      const index = components[1].indexOf('"');
      // Call oauth2 token api with received SAML if any
      if (index > 0) this.samlResponse = components[1].substring(0, index);
      if (this.samlResponse) this.getOAuthToken();
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
    // Go to standard login page and block navigation when
    //   - No SAMLResponse has been detected
    //   - WAYF redirects to web standard login page
    const url = request.url;
    if (this.isFirstLoadFinished && url !== this.wayfUrl && this.pfUrl && url.startsWith(this.pfUrl)) {
      if (!this.samlResponse)
        this.props.navigation.replace(authRouteNames.loginHome, { platform: this.props.route.params.platform });
      return false;
    }
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
