import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  emptyScreenContainer: {
    paddingTop: 0,
    backgroundColor: theme.palette.grey.white,
  },
  emptyScreenTitle: {
    marginTop: UI_SIZES.spacing.small,
  },
  headingText: {
    marginBottom: UI_SIZES.spacing.minor,
    color: theme.ui.text.light,
  },
  listContentContainer: {
    rowGap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
  },
});
