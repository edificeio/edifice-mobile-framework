import * as React from 'react';

import { useOpenMedia } from '~/modules/media/hooks';
import { MediaType } from '~/modules/media/types';

/**
 * Opens the image of a choice in the carousel.
 * @returns `openChoiceImage(image)`, which does nothing when the choice has no image.
 */
export const useOpenChoiceImage = () => {
  const { openCarousel } = useOpenMedia();
  return React.useCallback(
    (image: string | null) => {
      if (image) openCarousel({ media: [{ mime: 'image/*', src: image, type: MediaType.IMAGE }] });
    },
    [openCarousel],
  );
};
