import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  bottomSheetContainer: {
    rowGap: UI_SIZES.spacing.big,
  },
  bottomSheetMissedCallContainer: {
    rowGap: UI_SIZES.spacing.medium,
  },
  bottomSheetMissedCallText: {
    color: theme.palette.status.failure.regular,
  },
  bottomSheetPendingContainer: {
    rowGap: UI_SIZES.spacing.big,
  },
  dayPickerContainer: {
    borderBottomColor: theme.palette.grey.cloudy,
    borderBottomWidth: UI_SIZES.border.thin,
    paddingHorizontal: UI_SIZES.spacing.large,
    paddingVertical: UI_SIZES.spacing.medium,
  },
  emptyScreenContainer: {
    backgroundColor: theme.palette.grey.white,
    justifyContent: 'center',
    paddingTop: 0,
  },
  listContentContainer: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
    rowGap: UI_SIZES.spacing.medium,
  },
  pageContainer: {
    backgroundColor: theme.palette.grey.white,
  },
});
