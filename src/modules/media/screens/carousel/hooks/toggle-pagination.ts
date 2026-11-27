import * as React from 'react';

import { SharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { PAGINATION_ANIMATION_DURATION, PAGINATION_ANIMATION_OFFSET } from '~/modules/media/screens/carousel/constants';
import { FileMedia, isEmbeddedMedia, isPlayableMedia } from '~/modules/media/types';

const PAGINATION_ANIMATION_DELAY = 300;

export const useTogglePagination = (
  media: FileMedia[],
  paginationTranslateY: SharedValue<number>,
  setIsPaginationVisible: (visible: boolean) => void,
) => {
  const togglePaginationComponent = React.useCallback(
    (index: number, previousIndex: number) => {
      const currentIsPlayable = isPlayableMedia(media[index]);
      const previousIsPlayable = isPlayableMedia(media[previousIndex]);
      const currentIsEmbedded = isEmbeddedMedia(media[index]) || (media[index].type as string) === 'iframe';
      const previousIsEmbedded = isEmbeddedMedia(media[previousIndex]) || (media[previousIndex].type as string) === 'iframe';

      const shouldHidePagination = currentIsPlayable || currentIsEmbedded;
      const previousWasHidden = previousIsPlayable || previousIsEmbedded;

      if (shouldHidePagination) {
        if (previousWasHidden) {
          paginationTranslateY.value = PAGINATION_ANIMATION_OFFSET;
          setIsPaginationVisible(false);
        } else {
          paginationTranslateY.value = 0;
          paginationTranslateY.value = withDelay(
            PAGINATION_ANIMATION_DELAY,
            withTiming(PAGINATION_ANIMATION_OFFSET, { duration: PAGINATION_ANIMATION_DURATION }),
          );
          setIsPaginationVisible(true);
        }
      } else {
        paginationTranslateY.value = withTiming(0, { duration: PAGINATION_ANIMATION_DURATION });
        setIsPaginationVisible(true);
      }
    },
    [media, paginationTranslateY, setIsPaginationVisible],
  );

  return togglePaginationComponent;
};
