import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import type { ImageSize } from '~/framework/components/inputs/rich-text/native-viewer/types';

const styles = StyleSheet.create({
  image: {
    borderRadius: UI_SIZES.radius.small,
  },
  // Until the natural size is known (no size in the html, first load)
  imageDefault: {
    aspectRatio: UI_SIZES.aspectRatios.thumbnail,
    width: '100%',
  },
});

// Full width of the message, without upscaling small images
export const getImageStyle = (naturalSize?: ImageSize) =>
  naturalSize
    ? [styles.image, { aspectRatio: naturalSize.width / naturalSize.height, maxWidth: naturalSize.width, width: '100%' as const }]
    : [styles.image, styles.imageDefault];

export default styles;
