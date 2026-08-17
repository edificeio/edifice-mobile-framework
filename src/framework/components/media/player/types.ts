import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReactVideoSource } from 'react-native-video';
import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';

import { AudienceParameter } from '~/framework/modules/audience/types';
import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import { MediaType } from '~/framework/modules/media';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';

export interface MediaPlayerPlayableParams {
  type: MediaType.AUDIO | MediaType.VIDEO;
  source: ReactVideoSource;
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
