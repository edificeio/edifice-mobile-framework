import CookieManager from '@react-native-cookies/cookies';
import I18n from 'i18n-js';
import * as React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import DropDownPicker from 'react-native-dropdown-picker';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { HeaderTitle } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import { PFLogo } from '~/framework/components/pfLogo';
import { SmallText } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { IOAuthToken, OAuth2RessourceOwnerPasswordClient, OAuthCustomTokens, OAuthErrorType } from '~/infra/oauth';
import { Loading } from '~/ui/Loading';
import { checkVersionThenLogin } from '~/user/actions/version';
import { IUserAuthState } from '~/user/reducers/auth';
import { getAuthState } from '~/user/selectors';

import { actionTypeLoginCancel } from '../actions/actionTypes/login';

enum WAYFPageMode {
  EMPTY = 0,
  ERROR = 1,
  LOADING = 2,
  SELECT = 3,
  WEBVIEW = 4,
}

export interface IWAYFPageProps {
  auth: IUserAuthState;
  dispatch?: any;
  navigation?: any;
}

interface IWAYFPageState {
  // User selection dropdown opened?
  dropdownOpened: boolean;
  // To prevent java.util.concurrent.TimeoutException crashes
  loadStarted: boolean;
  // Current display mode: Error Message | Loading Indicator | User Selection | WebView
  mode: WAYFPageMode;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: UI_SIZES.spacing.large,
    paddingVertical: UI_SIZES.spacing.huge * 1.5,
  },
  error: {
    flexGrow: 0,
    marginTop: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
    alignSelf: 'center',
    color: theme.palette.status.failure.regular,
  },
  //help: { marginTop: UI_SIZES.spacing.large, textAlign: 'center' },
  safeView: { flex: 1, backgroundColor: theme.ui.background.card },
  select: { borderColor: theme.palette.primary.regular, borderWidth: 1 },
  selectBackDrop: { flex: 1 },
  selectContainer: { borderColor: theme.palette.primary.regular, borderWidth: 1, maxHeight: 120 },
  selectPlaceholder: { color: theme.ui.text.light },
  selectText: { color: theme.ui.text.light },
  text: { textAlign: 'center' },
  webview: { flex: 1, overflow: 'hidden' },
  webviewHidden: { opacity: 0 },
  webviewVisible: { opacity: 1 },
});

export class WAYFPage extends React.Component<IWAYFPageProps, IWAYFPageState> {
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
      this.props.dispatch({ type: actionTypeLoginCancel });
      this.props.navigation.navigate('LoginWAYF');
    },
    // WAYFPageMode.ERROR: Go to top of wayf navigation stack
    () => {
      this.props.dispatch({ type: actionTypeLoginCancel });
      this.props.navigation.navigate('LoginWAYF');
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
        <EmptyScreen svgImage="empty-content" text={I18n.t('login-wayf-empty-text')} title={I18n.t('login-wayf-empty-title')} />
      );
    },
    // WAYFPageMode.ERROR: Display error message
    () => {
      Trackers.trackDebugEvent('Auth', 'WAYF', `ERROR: ${this.error}`);
      return (
        <View style={styles.container}>
          <PFLogo />
          <SmallText style={styles.error}>
            {I18n.t('auth-error-' + this.error, {
              version: DeviceInfo.getVersion(),
              errorcode: this.error,
              currentplatform: DEPRECATED_getCurrentPlatform()!.url,
            })}
          </SmallText>
          <ActionButton text={I18n.t('login-wayf-error-retry')} action={() => this.displayWebview()} />
        </View>
      );
    },
    // WAYFPageMode.LOADING: Display loading indicator
    () => {
      Trackers.trackDebugEvent('Auth', 'WAYF', 'LOADING');
      return (
        <View style={styles.container}>
          <PFLogo />
          <SmallText style={styles.text}>{I18n.t('login-wayf-loading-text')}</SmallText>
          <ActivityIndicator size="large" color={theme.palette.primary.regular} />
        </View>
      );
    },
    // case WAYFPageMode.SELECT: Display user selection
    (dropdownOpened: boolean) => {
      Trackers.trackDebugEvent('Auth', 'WAYF', 'SELECT');
      return (
        <TouchableWithoutFeedback
          style={styles.selectBackDrop}
          onPress={() => {
            this.setState({ dropdownOpened: false });
          }}>
          <View style={styles.container}>
            <SmallText style={styles.text}>{I18n.t('login-wayf-select-text')}</SmallText>
            <DropDownPicker
              dropDownContainerStyle={styles.selectContainer}
              items={this.dropdownItems}
              open={this.state.dropdownOpened}
              placeholder={I18n.t('login-wayf-select-placeholder')}
              placeholderStyle={styles.selectPlaceholder}
              setOpen={() =>
                this.setState({
                  dropdownOpened: !dropdownOpened,
                })
              }
              setValue={callback => (this.dropdownValue = callback())}
              showTickIcon={false}
              style={styles.select}
              textStyle={styles.selectText}
              value={this.dropdownValue}
            />
            <View>
              <ActionButton
                text={I18n.t('login-wayf-select-button')}
                disabled={this.dropdownValue === null}
                action={() => this.loginWithCustomToken()}
              />
              {/*<SmallText style={styles.help}>{I18n.t('login-wayf-select-help')}</SmallText>*/}
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    },
    // case WAYFPageMode.WEBVIEW: Display WebView
    () => {
      const { loadStarted } = this.state;
      Trackers.trackDebugEvent('Auth', 'WAYF', 'WEBVIEW');
      return (
        <WebView
          ref={(ref: WebView) => this.setWebView(ref)}
          injectedJavaScript={WAYFPage.POST_HTML_CONTENT}
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
          style={[styles.webview, loadStarted ? styles.webviewVisible : styles.webviewHidden]}
        />
      );
    },
  ];

  constructor(props: IWAYFPageProps) {
    super(props);
    const pfConf = DEPRECATED_getCurrentPlatform();
    this.pfUrl = pfConf?.url || '';
    this.wayfUrl = pfConf?.wayf || '';
    this.state = { dropdownOpened: false, loadStarted: false, mode: WAYFPageMode.WEBVIEW };
    this.backActions.forEach(action => {
      action.bind(this);
    });
  }

  componentDidUpdate(prevProps: IWAYFPageProps) {
    const { auth } = this.props;
    // Detect && display potential login error sent after checkVersionThenLogin(false) call
    if (auth?.error?.length && auth?.error?.length > 0 && auth.error !== this.error) this.displayError(auth.error);
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
        navigation.navigate('LoginWAYF');
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
    this.clearDatas(() => {
      Trackers.trackDebugEvent('Auth', 'WAYF', 'LOGIN');
      this.displayLoading();
      this.samlResponse = null;
      this.props.dispatch(checkVersionThenLogin(false));
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
  onError(/*event*/) {
    // alert(event.nativeEvent.description + '[' + event.nativeEvent.url + ']');
    // Display empty screen
    this.displayEmpty();
  }

  // Called each time an http error occurs in WebView
  // See WebView onError property
  onHttpError(/*event*/) {
    // alert(event.nativeEvent.description + '[' + event.nativeEvent.url + ']');
    // Display empty screen
    this.displayEmpty();
  }

  onLoad() {
    // Flag first webview page loading completion
    this.isFirstLoadFinished = true;
  }

  onLoadStart() {
    // Prevent java.util.concurrent.TimeoutException crashes
    setTimeout(() => {
      this.setState({ loadStarted: true });
    }, 500);
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
      if (!this.samlResponse) this.props.navigation.replace('LoginHome');
      return false;
    }
    return true;
  }

  // Render header title depending on current display mode
  renderHeaderTitle(mode: WAYFPageMode) {
    return <HeaderTitle>{I18n.t(mode === WAYFPageMode.SELECT ? 'login-wayf-select-title' : 'login-wayf-main-title')}</HeaderTitle>;
  }

  public render() {
    const { dropdownOpened, mode } = this.state;
    const navBarInfo = {
      title: this.renderHeaderTitle(mode),
    };
    return (
      <PageView
        navigation={this.props.navigation}
        {...(mode === WAYFPageMode.LOADING
          ? { navBar: navBarInfo }
          : { navBarWithBack: navBarInfo, onBack: () => this.onBack(mode) })}>
        <SafeAreaView style={styles.safeView}>{this.contentComponents[mode](dropdownOpened)}</SafeAreaView>
      </PageView>
    );
  }
}

const ConnectedWAYFPage = connect((state: any, props: any): IWAYFPageProps => {
  return {
    auth: getAuthState(state),
  };
})(WAYFPage);

export default withViewTracking('auth/WAYF')(ConnectedWAYFPage);
