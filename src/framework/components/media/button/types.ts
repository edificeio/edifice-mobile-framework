import { ImageURISource, ViewStyle } from 'react-native';

import { AudienceParameter } from '~/framework/modules/core/audience/types';

export interface IPlayerProps {
  type: 'audio' | 'video' | 'web';
  source: ImageURISource;
  posterSource?: ImageURISource;
  ratio?: number;
  style?: ViewStyle;
  referer: AudienceParameter;
}
