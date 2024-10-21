import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  contentContainer: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
    rowGap: UI_SIZES.spacing.small,
  },
  countMethodText: {
    color: theme.ui.text.light,
    marginTop: UI_SIZES.spacing.small,
  },
  dropdownContainer: {
    zIndex: 10,
  },
});
