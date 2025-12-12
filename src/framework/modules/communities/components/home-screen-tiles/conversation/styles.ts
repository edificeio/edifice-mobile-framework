import { StyleSheet } from 'react-native';

import { baseStyles } from '~/framework/modules/communities/components/home-screen-tiles/styles';

export default StyleSheet.create({
  tileCaption: {
    ...baseStyles.tileCaption,
  },
  tileCaptionTextUnavailable: {
    ...baseStyles.tileCaptionTextUnavailable,
  },
  tileConversation: {
    ...baseStyles.tileBase,
    ...baseStyles.tileUnavailable,
  },
  tileLoader: {
    ...baseStyles.tileUnavailableLoader,
  },
});
