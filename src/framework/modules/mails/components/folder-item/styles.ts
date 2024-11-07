import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    borderRadius: UI_SIZES.radius.selector,
    columnGap: UI_SIZES.spacing.small,
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  isSelected: {
    backgroundColor: theme.palette.primary.pale,
  },
  text: {
    flexShrink: 1,
  },
});
