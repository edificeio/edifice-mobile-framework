import { ImageURISource, ViewStyle } from 'react-native';

import type { ReactVideoSourceProperties } from 'react-native-video';
import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';

import { MediaType } from '~/framework/modules/media';
import type { AudienceParameter } from '~/modules/audience/model';

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
