import type { MediaPlayerParams } from './types';

import { navigate } from '~/framework/navigation/helper';
import { ModalsRouteNames } from '~/framework/navigation/modals';

export function openMediaPlayer(props: MediaPlayerParams) {
  navigate(ModalsRouteNames.MediaPlayer, props);
}
