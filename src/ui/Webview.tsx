
import React from "react";
import Conf from "../../ode-framework-conf";
import WebView, { WebViewProps } from "react-native-webview";



export function SafeWebView<P>(props: WebViewProps & P) {
    const id = Conf.currentPlatform? (Conf.currentPlatform.webviewIdentifier || Conf.webviewIdentifier): (Conf.webviewIdentifier || "ode-unknown");
    return <WebView {...props}  source={{...(props?props.source:{}), headers:{
        'X-Requested-With': id
    }}} injectedJavaScript={`window.WEBVIEW_BUNDLEID=${id}`} />;
};