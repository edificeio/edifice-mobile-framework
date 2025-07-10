import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  emptyScreen: {
    backgroundColor: theme.palette.grey.white,
  },
  itemSeparator: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  listPadding: {
    paddingVertical: UI_SIZES.spacing.big,
  },
});
