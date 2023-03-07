import { NavigationInjectedProps } from 'react-navigation';

import MediaPlayer from './component';
import { MediaPlayerParams, MediaType } from './types';

export { MediaType };

export function openMediaPlayer(props: MediaPlayerParams, navigation: NavigationInjectedProps['navigation']) {
  navigation.navigate('mediaPlayerModal', props);
}

export default MediaPlayer;
