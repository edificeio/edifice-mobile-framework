import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const WIDTH_THUMBNAIL_THREAD_ITEM = 84;

export default StyleSheet.create({
  item: {
    maxWidth: WIDTH_THUMBNAIL_THREAD_ITEM,
    marginRight: UI_SIZES.spacing.big,
  },
  textItem: {
    textAlign: 'center',
    lineHeight: 20,
    marginTop: UI_SIZES.spacing.tiny,
  },
  textItemSelected: {
    fontWeight: '700',
  },
  textItemNotSelected: {
    color: theme.palette.grey.stone,
  },
});
