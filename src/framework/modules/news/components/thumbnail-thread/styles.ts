import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

const WIDTH_THUMBNAIL_THREAD_ITEM_RECTANGLE = getScaleWidth(84);
const WIDTH_THUMBNAIL_THREAD_ITEM_SQUARE = UI_SIZES.dimensions.width.mediumPlus;
const BORDER_WIDTH = 4;

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
  thumbnailContainerSelected: {
    position: 'relative',
  },
  thumbnailItemSelected: {
    width: WIDTH_THUMBNAIL_THREAD_ITEM_RECTANGLE + BORDER_WIDTH,
    aspectRatio: UI_SIZES.aspectRatios.thumbnail,
    borderWidth: BORDER_WIDTH,
    borderColor: theme.palette.primary.regular,
    position: 'absolute',
    top: -(BORDER_WIDTH / 2),
    left: -(BORDER_WIDTH / 2),
    borderRadius: UI_SIZES.radius.card,
    zIndex: 1,
  },
  thumbnailItemSquare: {
    width: WIDTH_THUMBNAIL_THREAD_ITEM_SQUARE,
    height: WIDTH_THUMBNAIL_THREAD_ITEM_SQUARE,
    borderRadius: UI_SIZES.radius.small,
  },
  thumbnailNoIconDisabled: {
    backgroundColor: theme.palette.grey.cloudy,
  },
});
