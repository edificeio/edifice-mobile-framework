import { NativeStackScreenProps } from '@react-navigation/native-stack';

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
}

export interface MediaPlayerProps extends NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.MediaPlayer> {
  connected: boolean;
}
