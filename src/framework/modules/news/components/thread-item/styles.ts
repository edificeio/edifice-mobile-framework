import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const BORDER_WIDTH = 4;
export const WIDTH_THUMBNAIL_THREAD_ITEM = getScaleWidth(84);

export default StyleSheet.create({
  item: {
    marginRight: UI_SIZES.spacing.big,
    maxWidth: WIDTH_THUMBNAIL_THREAD_ITEM + BORDER_WIDTH,
  },
  textItem: {
    lineHeight: 20,
    marginTop: UI_SIZES.spacing.tiny,
    textAlign: 'center',
  },
  textItemNotSelected: {
    color: theme.palette.grey.stone,
  },
});
