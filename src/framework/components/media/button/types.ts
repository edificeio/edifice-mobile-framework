import { ImageURISource, ViewStyle } from 'react-native';

export interface IPlayerProps {
  type: 'audio' | 'video' | 'web';
  source: ImageURISource;
  posterSource?: ImageURISource;
  ratio?: number;
  style?: ViewStyle;
}
