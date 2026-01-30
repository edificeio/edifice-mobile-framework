import { ImageURISource, ViewStyle } from 'react-native';

import { AudienceParameter } from '~/framework/modules/audience/types';
import { MediaType } from '~/framework/util/media';

export interface IPlayerProps {
  type: MediaType.AUDIO | MediaType.VIDEO | MediaType.EMBEDDED;
  source: ImageURISource;
  posterSource?: ImageURISource;
  ratio?: number;
  style?: ViewStyle;
  referer: AudienceParameter;
}
