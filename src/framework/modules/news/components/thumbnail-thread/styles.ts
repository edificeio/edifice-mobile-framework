import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const WIDTH_THUMBNAIL_THREAD_ITEM_RECTANGLE = getScaleWidth(84);
const WIDTH_THUMBNAIL_THREAD_ITEM_SQUARE = UI_SIZES.dimensions.width.mediumPlus;
const BORDER_WIDTH = 4;

export default StyleSheet.create({
  thumbnailContainerSelected: {
    position: 'relative',
  },
  thumbnailItem: {
    justifyContent: 'center',
  },
  thumbnailItemRectangle: {
    aspectRatio: UI_SIZES.aspectRatios.thumbnail,
    borderRadius: UI_SIZES.radius.card,
    marginLeft: BORDER_WIDTH / 2,
    marginTop: BORDER_WIDTH / 2,
    width: WIDTH_THUMBNAIL_THREAD_ITEM_RECTANGLE,
  },
  thumbnailItemSquare: {
    borderRadius: UI_SIZES.radius.small,
    height: WIDTH_THUMBNAIL_THREAD_ITEM_SQUARE,
    width: WIDTH_THUMBNAIL_THREAD_ITEM_SQUARE,
  },
  thumbnailNoIconDisabled: {
    backgroundColor: theme.palette.grey.cloudy,
  },
  thumbnailSelectedItem: {
    aspectRatio: UI_SIZES.aspectRatios.thumbnail,
    borderRadius: UI_SIZES.radius.card,
    borderWidth: BORDER_WIDTH,
    left: 0,
    position: 'absolute',
    top: 0,
    width: WIDTH_THUMBNAIL_THREAD_ITEM_RECTANGLE + BORDER_WIDTH,
    zIndex: 1,
  },
});
