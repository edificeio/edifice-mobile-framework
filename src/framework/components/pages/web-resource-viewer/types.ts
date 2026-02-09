import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';

export interface WebResourceViewerProps {
  source: WebViewSourceUri;
  fetchResource?: () => Promise<void>;
}

export interface WebResourceViewerOwnProps
  extends WebResourceViewerProps, Pick<NativeStackScreenProps<ParamListBase>, 'navigation'> {}

export interface WebResourceViewerPrivateProps extends WebResourceViewerOwnProps {}
