import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';

import { AuthQueryParamToken } from '~/framework/modules/auth/model';
import { Platform } from '~/framework/util/appConf';

export interface WebResourceViewerProps {
  source: WebViewSourceUri | string;
  fetchResource?: () => Promise<void>;
  injectSearchParams?: Record<string, string>;
}

export interface WebResourceViewerStoreProps {
  platform?: Platform;
  queryParamToken?: AuthQueryParamToken;
}

export interface WebResourceViewerOwnProps
  extends WebResourceViewerProps,
    Pick<NativeStackScreenProps<ParamListBase>, 'navigation'> {}

export interface WebResourceViewerPrivateProps extends WebResourceViewerOwnProps, WebResourceViewerStoreProps {}
