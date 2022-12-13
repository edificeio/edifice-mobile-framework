import React from 'react';
import WebView, { WebViewProps } from 'react-native-webview';
import { connect } from 'react-redux';

import { IGlobalState } from '~/app/store';
import { ISession } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';

function SafeWebView<P>(props: WebViewProps & P & { session?: ISession }) {
  const id = props.session?.platform.webviewIdentifier || 'ode-unknown';
  return (
    <WebView
      {...props}
      androidLayerType="software"
      source={{
        ...(props ? props.source : {}),
        headers: {
          'X-Requested-With': id,
        },
      }}
      injectedJavaScript={`window.WEBVIEW_BUNDLEID=${id}`}
    />
  );
}

export default connect((state: IGlobalState) => ({
  session: getSession(state), // Attention : peut être undefined, le composant doit gérer le cas
}))(SafeWebView);
