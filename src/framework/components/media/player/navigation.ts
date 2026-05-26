import { navigationRef } from '~/app/navigation';

import type { MediaPlayerParams } from './types';
import { MultimediaCarouselNavParams } from '../../carousel-multimedia/openCarousel';

export function openMediaPlayer(props: MediaPlayerParams) {
  const params: MultimediaCarouselNavParams = {
    media: [
      {
        mime: props.filetype ?? 'application/octet-stream',
        src: props.source,
        type: props.type,
      },
    ],
    startIndex: 0,
  };
  navigationRef.navigate('media/carousel', params);
  // navigate(ModalsRouteNames.MediaPlayer, props);
}
