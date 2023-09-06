import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

const BORDER_WIDTH = 4;
export const WIDTH_THUMBNAIL_THREAD_ITEM = getScaleWidth(84);

export default StyleSheet.create({
  item: {
    maxWidth: WIDTH_THUMBNAIL_THREAD_ITEM + BORDER_WIDTH,
    marginRight: UI_SIZES.spacing.big,
  },
  textItem: {
    textAlign: 'center',
    lineHeight: 20,
    marginTop: UI_SIZES.spacing.tiny,
  },
  textItemNotSelected: {
    color: theme.palette.grey.stone,
  },
});
