import { navigationRef } from '~/app/navigation';
import { convertImageUrlToFileMedia } from '~/framework/components/carousel/utils/adapter';

export const openCarousel = (image: string | null) => {
  if (!image) return;
  navigationRef.navigate('media/carousel', { media: [convertImageUrlToFileMedia(image)] });
};
