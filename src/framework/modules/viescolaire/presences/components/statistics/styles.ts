import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  contentContainer: {
    rowGap: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
  },
  countMethodText: {
    marginTop: UI_SIZES.spacing.small,
    color: theme.ui.text.light,
  },
  dropdownContainer: {
    zIndex: 10,
  },
});
