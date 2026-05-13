import { StyleSheet } from 'react-native';

import { baseStyles } from '~/framework/modules/communities/components/home-screen-tiles/styles';

export default StyleSheet.create({
  tileCaption: {
    ...baseStyles.tileCaption,
  },
  tileCaptionTextAvailable: {
    ...baseStyles.tileCaptionTextAvailable,
  },
  tileCaptionTextUnavailable: {
    ...baseStyles.tileCaptionTextUnavailable,
  },
  tileCoursesAvailable: {
    ...baseStyles.tileBase,
    ...baseStyles.tileAvailable,
    justifyContent: 'space-between',
  },
  tileCoursesUnavailable: {
    ...baseStyles.tileBase,
    ...baseStyles.tileUnavailable,
  },
  tileLoader: {
    ...baseStyles.tileUnavailableLoader,
  },
});
