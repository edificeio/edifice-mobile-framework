import { navigate } from '~/framework/navigation/helper';
import { ModalsRouteNames } from '~/framework/navigation/modals';

import MediaPlayer, { computeNavBar } from './component';
import { MediaPlayerParams, MediaType } from './types';

export { MediaType, computeNavBar };

export function openMediaPlayer(props: MediaPlayerParams) {
  navigate(ModalsRouteNames.MediaPlayer, props);
}

export default MediaPlayer;
