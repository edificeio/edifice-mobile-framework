import { NavigationInjectedProps } from 'react-navigation';

export enum MediaType {
  AUDIO = 'audio',
  VIDEO = 'video',
  WEB = 'web',
}

export interface MediaPlayerParams {
  type: MediaType;
  source: any;
}

export interface MediaPlayerProps extends NavigationInjectedProps<MediaPlayerParams> {
  connected: boolean;
}
