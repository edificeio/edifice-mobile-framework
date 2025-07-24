import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  itemSeparator: {
    height: UI_SIZES.spacing.medium,
  },
  listContainer: {
    backgroundColor: theme.palette.grey.white,
    flex: 1,
  },
});
