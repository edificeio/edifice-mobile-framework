import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  emptyScreenContainer: {
    backgroundColor: theme.palette.grey.white,
    paddingTop: 0,
  },
  emptyScreenTitle: {
    marginTop: UI_SIZES.spacing.small,
  },
  headingText: {
    color: theme.ui.text.light,
    marginBottom: UI_SIZES.spacing.minor,
  },
  listContentContainer: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
    rowGap: UI_SIZES.spacing.minor,
  },
});
