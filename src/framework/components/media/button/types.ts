import { ImageURISource, ViewStyle } from 'react-native';

import { ReactVideoSourceProperties } from 'react-native-video';
import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';

import { AudienceParameter } from '~/framework/modules/audience/types';
import { MediaType } from '~/framework/util/media';

export type IPlayerProps = (
  | { type: MediaType.AUDIO | MediaType.VIDEO; source: ReactVideoSourceProperties }
  | { type: MediaType.EMBEDDED; source: WebViewSourceUri }
) & {
  onPreviewPress?: () => void;
  posterSource?: ImageURISource;
  ratio?: number;
  style?: ViewStyle;
  referer: AudienceParameter;
};
