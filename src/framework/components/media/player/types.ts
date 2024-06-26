import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import { AudienceParameter } from '~/framework/modules/core/audience/types';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';

export enum MediaType {
  AUDIO = 'audio',
  VIDEO = 'video',
  WEB = 'web',
}

export interface MediaPlayerParams {
  type: MediaType;
  source: any;
  filetype?: string;
  referer: AudienceParameter;
}

export interface MediaPlayerProps extends NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.MediaPlayer> {
  connected: boolean;
  session?: AuthActiveAccount;
}
