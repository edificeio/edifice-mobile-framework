import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import type { ImageSize } from '~/framework/components/inputs/rich-text/native-viewer/types';

const styles = StyleSheet.create({
  image: {
    borderRadius: UI_SIZES.radius.small,
  },
  // No size in the html: the natural size is only known once loaded, and resizing the image then would shift the
  // content around it (e.g. a list scrolled by the user). The image is displayed inside a fixed frame instead.
  imageFrame: {
    aspectRatio: UI_SIZES.aspectRatios.thumbnail,
    width: '100%',
  },
});

export const getImageStyle = (declaredSize?: ImageSize) =>
  declaredSize
    ? [
        styles.image,
        { aspectRatio: declaredSize.width / declaredSize.height, maxWidth: declaredSize.width, width: '100%' as const },
      ]
    : [styles.image, styles.imageFrame];

export default styles;
