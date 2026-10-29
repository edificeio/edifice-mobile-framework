import React from 'react';

import { useNavigation } from '@react-navigation/native';

import { INTENT_TYPE, openIntent } from '~/app/intents';
import type { RootNavigation } from '~/app/navigation-new';
import toast from '~/framework/components/toast';
import { openUrl } from '~/framework/util/linking';
import type { MediaCarouselParams } from '~/modules/media/screens/carousel/screen';
import { isFileMedia, isResourceMedia, type Media, MediaType } from '~/modules/media/types';
import { toURISource } from '~/modules/media/util';

/**
 * The functions that open medias, with the navigation of the screen that calls the hook:
 * - `openCarousel`: the carousel on the files given;
 * - `openPdf`: a pdf in the carousel, which is the reader of the app;
 * - `openMedias`: the one of the medias that was touched, the way its type needs: the files in the carousel (with the other files of the
 *   list, the touched one first), a resource in its app, anything else in the browser;
 * - `openMedia`: the same for a single media.
 * They keep the same reference as long as the navigation does.
 */
export const useOpenMedia = () => {
  const navigation = useNavigation<RootNavigation>();

  return React.useMemo(() => {
    const openCarousel = (params: MediaCarouselParams) => {
      navigation.navigate('media/carousel', params);
    };

    const openPdf = ({ src, title }: { src: string; title?: string }) => {
      openCarousel({ media: [{ mime: 'application/pdf', src, type: MediaType.ATTACHMENT }], startIndex: 0, title });
    };

    const openMedias = (medias: Media[], index = 0, opts?: { title?: string }) => {
      const media = medias[index];
      if (!media) {
        toast.showError();
        return;
      }
      if (isFileMedia(media)) {
        const files = medias.filter(isFileMedia);
        openCarousel({ media: files, startIndex: Math.max(files.indexOf(media), 0), title: opts?.title });
        return;
      }
      const url = toURISource(media.src).uri;
      if (!url) {
        toast.showError();
      } else if (isResourceMedia(media)) {
        // ToDo(media-migration): the apps tell how to open their resources through intents. They will be handled by myapps, which will
        // relay to media when needed.
        openIntent(media.appName, INTENT_TYPE.OPEN_RESOURCE, { id: media.resourceId, url });
      } else {
        openUrl(url);
      }
    };

    const openMedia = (media: Media, opts?: Parameters<typeof openMedias>[2]) => openMedias([media], 0, opts);

    return { openCarousel, openMedia, openMedias, openPdf };
  }, [navigation]);
};
