import { navigationRef } from '~/app/navigation';
import { MultimediaCarouselNavParams } from '~/framework/components/carousel-multimedia/openCarousel';

import type { MediaPlayerParams } from './types';

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
