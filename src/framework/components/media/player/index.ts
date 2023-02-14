import { navigate } from '~/framework/navigation/helper';

import MediaPlayer from './component';
import { MediaPlayerParams, MediaType } from './types';

export { MediaType };

export function openMediaPlayer(props: MediaPlayerParams) {
  navigate('mediaPlayerModal', props);
}

export default MediaPlayer;
