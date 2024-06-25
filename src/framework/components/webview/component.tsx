import React, { useMemo } from 'react';
import { WebView as RNWebView, WebViewProps } from 'react-native-webview';
import type { WebViewSource, WebViewSourceHtml, WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';

import { getSession } from '~/framework/modules/auth/reducer';
import appConf from '~/framework/util/appConf';

const isSourceHtml = (source: WebViewSource | undefined): source is WebViewSourceHtml =>
  (source as WebViewSourceHtml | undefined)?.html !== undefined;
const isSourceUri = (source: WebViewSource | undefined): source is WebViewSourceUri =>
  (source as WebViewSourceUri | undefined)?.uri !== undefined;

export function WebView<P>(props: WebViewProps & P) {
  const { injectedJavaScript, source, ...otherProps } = props;
  const id = getSession()?.platform ? appConf.webviewIdentifier : appConf.webviewIdentifier || 'ode-unknown';
  const realSource: WebViewSource | undefined = useMemo(() => {
    if (isSourceHtml(source)) {
      return source;
    } else if (isSourceUri(source)) {
      return {
        ...source,
        headers: {
          'X-Requested-With': id,
          ...source.headers,
        },
      } as WebViewSourceUri;
    } else return undefined;
  }, [id, source]);

  const realInjectedJavaScript = `window.WEBVIEW_BUNDLEID=${id}; ${injectedJavaScript}`;

  return <RNWebView {...otherProps} source={realSource} injectedJavaScript={realInjectedJavaScript} />;
}
