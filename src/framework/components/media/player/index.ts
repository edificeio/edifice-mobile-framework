import { navigate } from '~/framework/navigation/helper';
import { ModalsRouteNames } from '~/framework/navigation/modals';

import MediaPlayer, { computeHiddenNavBar, computeNavBar } from './component';
import { MediaPlayerParams, MediaType } from './types';

export { MediaType, computeNavBar, computeHiddenNavBar };

export function openMediaPlayer(props: MediaPlayerParams) {
  navigate(ModalsRouteNames.MediaPlayer, props);
}

export default MediaPlayer;
