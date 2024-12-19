import MediaPlayer from './component';
import { MediaPlayerParams, MediaType } from './types';

import { navigate } from '~/framework/navigation/helper';
import { ModalsRouteNames } from '~/framework/navigation/modals';

export { MediaType };

export function openMediaPlayer(props: MediaPlayerParams) {
  navigate(ModalsRouteNames.MediaPlayer, props);
}

export default MediaPlayer;
