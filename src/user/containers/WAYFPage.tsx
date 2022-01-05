import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, SafeAreaView } from 'react-native';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { connect } from 'react-redux';

import { FakeHeader, HeaderAction, HeaderCenter, HeaderLeft, HeaderRow, HeaderTitle } from '~/framework/components/header';
import { LoadingIndicator } from '~/framework/components/loading';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';

export interface IWAYFPageProps {
  navigation?: any;
}

interface IWAYFPageState {
  connecting: boolean;
}

export class WAYFPage extends React.Component<IWAYFPageProps, IWAYFPageState> {
  // Platorrm coniguration
  private pfConf = DEPRECATED_getCurrentPlatform();
  // Platform url
  private pfUrl: string = '';
  // Used to post HTML content and retrieve it via onMessage
  // Injected in WebView with injectedJavaScript property
  // Executed each time WebView url changes
  private POST_HTML_CONTENT: string = 'ReactNativeWebView.postMessage(document.documentElement.innerHTML); true;';
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

  constructor(props: IWAYFPageProps) {
    super(props);
    this.state = { connecting: false };
    this.pfUrl = this.pfConf?.url || '';
    this.wayfUrl = this.pfConf?.wayf || '';
  }

  // Back handler
  onBack() {
    // Go back through WebView back history if possible otherwise go back through navigation stack
    (this.webviewCanGoBack && this.webview?.goBack()) || (!this.webviewCanGoBack && this.props.navigation.goBack());
  }

  // Called each time POST_HTML_CONTENT js code is executed (when WebView url changes)
  // See WebView onMessage property
  onMessage(event: WebViewMessageEvent) {
    // Get HTML code
    const innerHTML = event?.nativeEvent?.data || '';
    // Retrieve potential SAMLResponse (Stored in <input type="hidden" name="SAMLResponse" value="[saml]"/>)
    const components = innerHTML.split('name="SAMLResponse" value="');
    if (components?.length === 2) {
      const index = components[1].indexOf('"');
      if (index > 0) {
        this.samlResponse = components[1].substring(0, index);
        this.setState({ connecting: true });
      }
    }
  }

  // Called each time WebView navigation state changes
  // See WebView onNavigationStateChange property
  onNavigationStateChange(navigationState: WebViewNavigation) {
    // WebView back history flag update
    this.webviewCanGoBack = navigationState.canGoBack;
    // Track new url
    Trackers.trackEvent('Auth', 'WAYF', navigationState.url);
  }

  // Called each time WebView url is about to change
  // Must return true|false to allow|avoid navigation
  // See WebView onNavigationStateChange property
  onShouldStartLoadWithRequest(request: ShouldStartLoadRequest) {
    // Go to standard login page and block navigation when
    //   - No SAMLResponse has been detected
    //   - WAYF redirects to web standard login page
    const url = request.url;
    if (!this.samlResponse && this.pfUrl && url.startsWith(this.pfUrl)) {
      this.props.navigation.navigate('LoginHome');
      return false;
    }
    return true;
  }

  public render() {
    const { connecting } = this.state;
    const backButton = connecting ? null : (
      <HeaderAction iconName={Platform.OS === 'ios' ? 'chevron-left1' : 'back'} iconSize={24} onPress={() => this.onBack()} />
    );
    const content = connecting ? (
      <LoadingIndicator />
    ) : (
      <WebView
        ref={(ref: WebView) => this.setWebView(ref)}
        injectedJavaScript={this.POST_HTML_CONTENT}
        javaScriptEnabled
        onMessage={(event: WebViewMessageEvent) => this.onMessage(event)}
        onNavigationStateChange={(navigationState: WebViewNavigation) => this.onNavigationStateChange(navigationState)}
        onShouldStartLoadWithRequest={(request: ShouldStartLoadRequest) => this.onShouldStartLoadWithRequest(request)}
        renderLoading={() => <LoadingIndicator />}
        source={{ uri: this.wayfUrl }}
        setSupportMultipleWindows={false}
        startInLoadingState
        style={{ flex: 1 }}
      />
    );
    return (
      <>
        <FakeHeader>
          <HeaderRow>
            <HeaderLeft>{backButton}</HeaderLeft>
            <HeaderCenter>
              <HeaderTitle>{I18n.t('login-wayf-view-title')}</HeaderTitle>
            </HeaderCenter>
          </HeaderRow>
        </FakeHeader>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>{content}</SafeAreaView>
      </>
    );
  }
}

const ConnectedWAYFPage = connect()(WAYFPage);

export default withViewTracking('auth/WAYF')(ConnectedWAYFPage);
