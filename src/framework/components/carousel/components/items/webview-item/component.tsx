import React from 'react';
import { StyleSheet } from 'react-native';

import { useHeaderHeight } from '@react-navigation/elements';
import { getBundleId } from 'react-native-device-info';
import { WebView, WebViewProps } from 'react-native-webview';

import { WebviewItemProps } from './types';

import { assertSession } from '~/framework/modules/auth/reducer';

const WebviewItem = ({ isCurrentItem, setIsWebviewError, src }: WebviewItemProps) => {
  const navBarHeight = useHeaderHeight();
  const webViewRef = React.useRef<WebView>(null);
  const session = assertSession();

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
        'Referer': session?.platform.url ?? getBundleId(),
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
      uri: src,
    };
  }, [session?.platform.url, src]);

  const webViewStyle = React.useMemo(() => {
    return { ...StyleSheet.absoluteFillObject, marginTop: navBarHeight };
  }, [navBarHeight]);

  React.useEffect(() => {
    if (!isCurrentItem) {
      webViewRef.current?.injectJavaScript('document.querySelectorAll("video").forEach(v => v.pause()); true;');
    }
  }, [isCurrentItem]);

  return (
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
