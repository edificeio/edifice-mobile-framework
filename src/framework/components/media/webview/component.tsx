import React from 'react';
import WebView, { WebViewProps } from 'react-native-webview';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import appConf from '~/framework/util/appConf';

export default function SafeWebView<P>(props: WebViewProps & P) {
  const id = DEPRECATED_getCurrentPlatform()!.webviewIdentifier || appConf.webviewIdentifier || 'ode-unknown';
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
