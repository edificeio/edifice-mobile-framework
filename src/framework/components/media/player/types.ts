import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReactVideoSourceProperties } from 'react-native-video';
import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';

import { AudienceParameter } from '~/framework/modules/audience/types';
import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { MediaType } from '~/framework/util/media/types';

export interface MediaPlayerPlayableParams {
  type: MediaType.AUDIO | MediaType.VIDEO;
  source: ReactVideoSourceProperties;
}

export interface MediaPlayerEmbeddedParams {
  type: MediaType.EMBEDDED;
  source: WebViewSourceUri;
}

export type MediaPlayerParams = {
  filetype?: string;
  referer: AudienceParameter;
} & (MediaPlayerPlayableParams | MediaPlayerEmbeddedParams);

export interface MediaPlayerProps extends NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.MediaPlayer> {
  connected: boolean;
  session?: AuthActiveAccount;
}
