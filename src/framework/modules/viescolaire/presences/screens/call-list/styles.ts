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
    paddingHorizontal: UI_SIZES.spacing.large,
    paddingVertical: UI_SIZES.spacing.medium,
    borderBottomWidth: UI_SIZES.border.thin,
    borderBottomColor: theme.palette.grey.cloudy,
  },
  emptyScreenContainer: {
    justifyContent: 'center',
    paddingTop: 0,
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
