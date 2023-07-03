import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const WIDTH_THUMBNAIL_THREAD_ITEM_RECTANGLE = 84;
const WIDTH_THUMBNAIL_THREAD_ITEM_SQUARE = UI_SIZES.dimensions.width.mediumPlus;

export default StyleSheet.create({
  thumbnailItem: {
    backgroundColor: theme.palette.primary.pale,
    justifyContent: 'center',
  },
  thumbnailItemRectangle: {
    width: WIDTH_THUMBNAIL_THREAD_ITEM_RECTANGLE,
    aspectRatio: UI_SIZES.aspectRatios.thumbnail,
    borderRadius: UI_SIZES.radius.card,
  },
  thumbnailItemSquare: {
    width: WIDTH_THUMBNAIL_THREAD_ITEM_SQUARE,
    height: WIDTH_THUMBNAIL_THREAD_ITEM_SQUARE,
    borderRadius: UI_SIZES.radius.small,
  },
  thumbnailItemSelected: {
    borderWidth: 4,
    borderColor: theme.palette.primary.regular,
  },
  thumbnailNoIconDisabled: {
    backgroundColor: theme.palette.grey.cloudy,
  },
});
