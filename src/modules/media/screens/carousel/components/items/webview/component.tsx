import React from 'react';
import { StyleSheet } from 'react-native';

import { useHeaderHeight } from '@react-navigation/elements';
import { WebView, WebViewProps } from 'react-native-webview';

import AppInfo from '~/framework/util/app-info';
import { getActiveAccount } from '~/modules/auth/store/accounts';

import { WebviewItemProps } from './types';

const WebviewItem = ({ isCurrentItem, setIsWebviewError, src }: WebviewItemProps) => {
  const navBarHeight = useHeaderHeight();
  const webViewRef = React.useRef<WebView>(null);
  const account = getActiveAccount();

  const onWebViewError = React.useCallback<NonNullable<WebViewProps['onError']>>(
    ({ nativeEvent }) => {
      console.error('[WebView Player] Error |', JSON.stringify(nativeEvent));
      setIsWebviewError(true);
    },
    [setIsWebviewError],
  );

  const onHttpError = React.useCallback<NonNullable<WebViewProps['onHttpError']>>(
    ({ nativeEvent }) => {
      console.error('[WebView Player] HTTP Error |', JSON.stringify(nativeEvent));
      setIsWebviewError(true);
    },
    [setIsWebviewError],
  );

  const webViewSource = React.useMemo(() => {
    return {
      headers: {
        'Referer': account?.platform.url ?? AppInfo.app.bundleId,
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
      uri: src,
    };
  }, [account?.platform.url, src]);

  const webViewStyle = React.useMemo(() => {
    return { ...StyleSheet.absoluteFill, marginTop: navBarHeight };
  }, [navBarHeight]);

  React.useEffect(() => {
    if (!isCurrentItem) {
      webViewRef.current?.injectJavaScript('document.querySelectorAll("video").forEach(v => v.pause()); true;');
    }
  }, [isCurrentItem]);

  return (
    // react-native-webview 14.0.1 declares `WebView<P = undefined>`: with the ref typed `WebView`, the props become `WebViewProps & undefined`, i.e. `never`.
    // Fixed upstream in 16.0.0 (`P = {}`, issue react-native-webview#3970): remove this suppression on the next update of react-native-webview.
    // @ts-expect-error props typed `never` by react-native-webview 14.0.1 (see above)
    <WebView
      allowsInlineMediaPlayback
      javaScriptEnabled
      onError={onWebViewError}
      onHttpError={onHttpError}
      ref={webViewRef}
      startInLoadingState
      source={webViewSource}
      style={webViewStyle}
    />
  );
};

export default React.memo(WebviewItem);
