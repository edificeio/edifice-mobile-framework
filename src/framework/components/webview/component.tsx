/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo } from 'react';
import { WebView as RNWebView, WebViewProps } from 'react-native-webview';

import { getSession } from '~/framework/modules/auth/reducer';
import appConf from '~/framework/util/appConf';

export function WebView<P>(props: WebViewProps & P) {
  const id = getSession()?.platform ? appConf.webviewIdentifier : appConf.webviewIdentifier || 'ode-unknown';
  const source = useMemo(
    () => ({
      ...(props ? props.source : {}),
      headers: {
        'X-Requested-With': id,
      },
    }),
    [id, props.source],
  );

  return <RNWebView {...props} source={source} injectedJavaScript={`window.WEBVIEW_BUNDLEID=${id}`} />;
}
