import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { AudienceParameter } from '~/framework/util/audience/types';

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
  session?: AuthLoggedAccount;
}
