import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  dayPickerContainer: {
    paddingHorizontal: UI_SIZES.spacing.large,
    paddingVertical: UI_SIZES.spacing.medium,
    borderBottomWidth: UI_SIZES.border.thin,
    borderBottomColor: theme.palette.grey.cloudy,
  },
  emptyScreenContainer: {
    backgroundColor: theme.palette.grey.white,
  },
  listContentContainer: {
    rowGap: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
  },
  pageContainer: {
    backgroundColor: theme.palette.grey.white,
  },
});
