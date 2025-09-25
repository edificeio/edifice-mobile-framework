import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  emptyContent: {
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  itemSeparator: {
    borderBottomColor: theme.palette.grey.cloudy,
    borderBottomWidth: UI_SIZES.border.normal,
  },
});
