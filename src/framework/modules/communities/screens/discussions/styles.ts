import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  emptyContent: {
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  itemContainer: {
    paddingBottom: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  list: {
    paddingBottom: UI_SIZES.spacing.medium,
  },
  title: {
    marginBottom: UI_SIZES.spacing.medium,
    marginHorizontal: UI_SIZES.spacing.big,
    marginTop: UI_SIZES.spacing.medium,
  },
  titlePlaceholder: {
    height: TextSizeStyle.Medium.lineHeight,
    marginBottom: UI_SIZES.spacing.medium,
    marginHorizontal: UI_SIZES.spacing.big,
    marginTop: UI_SIZES.spacing.medium,
  },
});
