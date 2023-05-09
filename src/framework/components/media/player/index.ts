import { navigate } from '~/framework/navigation/helper';
import { ModalsRouteNames } from '~/framework/navigation/modals';

import MediaPlayer, { computeHiddenNavBar, computeLoadingNavBar, computeNavBar } from './component';
import { MediaPlayerParams, MediaType } from './types';

export { MediaType, computeNavBar, computeHiddenNavBar, computeLoadingNavBar };

export function openMediaPlayer(props: MediaPlayerParams) {
  navigate(ModalsRouteNames.MediaPlayer, props);
}

export default MediaPlayer;
