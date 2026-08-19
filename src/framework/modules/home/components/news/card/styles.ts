import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

import { CARD_HEIGHT, CARD_WIDTH, THUMBNAIL_SIZE } from '../constants';

export default StyleSheet.create({
  body: {
    flex: 1,
    // The card has a fixed height, so anything too long is cut instead of overflowing.
    overflow: 'hidden',
  },
  card: {
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
  },
  threadTitle: {
    flexShrink: 1,
  },
  thumbnail: {
    borderRadius: UI_SIZES.radius.medium,
    height: THUMBNAIL_SIZE,
    overflow: 'hidden',
    width: THUMBNAIL_SIZE,
  },
  thumbnailImage: {
    height: THUMBNAIL_SIZE,
    width: THUMBNAIL_SIZE,
  },
});
