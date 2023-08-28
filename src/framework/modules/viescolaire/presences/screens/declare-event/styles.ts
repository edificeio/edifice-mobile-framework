import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: UI_SIZES.spacing.big,
    rowGap: UI_SIZES.spacing.big,
  },
  deleteActionContainer: {
    zIndex: -1,
  },
  fieldContainer: {
    rowGap: UI_SIZES.spacing.minor,
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
  },
  pageContainer: {
    backgroundColor: theme.palette.grey.white,
  },
  primaryActionContainer: {
    marginTop: UI_SIZES.spacing.big,
    zIndex: -1,
  },
  timePickerContainer: {
    alignSelf: 'center',
  },
});
