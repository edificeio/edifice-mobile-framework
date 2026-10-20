import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EdgeInsets } from 'react-native-safe-area-context';
import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';

export interface WebResourceViewerProps {
  source: WebViewSourceUri;
  fetchResource?: () => Promise<void>;
  /** Padding injected in the displayed page, in pixels, kept up to date when it changes (rotation). */
  contentInsets?: EdgeInsets;
}

export interface WebResourceViewerOwnProps
  extends WebResourceViewerProps, Pick<NativeStackScreenProps<ParamListBase>, 'navigation'> {}

export interface WebResourceViewerPrivateProps extends WebResourceViewerOwnProps {}
